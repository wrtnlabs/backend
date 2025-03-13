import "@nestia/fetcher/lib/PlainFetcher";
import {
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import http from "http";
import { Path } from "path-parser";
import typia, { TypeGuardError, tags } from "typia";
import { v4 } from "uuid";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { HubOrderErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderErrorCode";
import { HubOrderGoodErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderGoodErrorCode";
import { HubOrderPublishErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderPublishErrorCode";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSaleUnitParameter } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitParameter";

import { HubGlobal } from "../../../HubGlobal";
import { ErrorUtil } from "../../../utils/ErrorUtil";
import { StreamUtil } from "../../../utils/StreamUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubCustomerProvider } from "../actors/HubCustomerProvider";
import { HubSaleSnapshotUnitParameterProvider } from "../sales/HubSaleSnapshotUnitParameterProvider";

(global as any).fetch ??= require("node-fetch");

export namespace HubOrderGoodApiProvider {
  export interface ISocket {
    request: http.IncomingMessage;
    response: http.ServerResponse<http.IncomingMessage>;
  }

  export const intermediate = async (socket: ISocket): Promise<void> => {
    // Set CORS headers
    socket.response.setHeader("Access-Control-Allow-Origin", "*");
    socket.response.setHeader("Access-Control-Request-Method", "*");
    socket.response.setHeader(
      "Access-Control-Allow-Methods",
      "OPTIONS, GET, HEAD, POST, PATCH, PUT, DELETE",
    );
    socket.response.setHeader("Access-Control-Allow-Headers", "*");
    socket.response.setHeader("Access-Control-Allow-Credentials", "true");
    socket.response.setHeader("Access-Control-Max-Age", 2592000);
    if (socket.request.method?.toLowerCase() === "options") {
      socket.response.writeHead(204);
      socket.response.end();
      return;
    } else if (isRoot(socket.request)) {
      socket.response.writeHead(200);
      socket.response.end();
      return;
    }

    const body: boolean =
      socket.request.method?.toLocaleLowerCase() === "get" ||
      socket.request.method?.toLocaleLowerCase() === "head"
        ? false
        : (() => {
            socket.request.pause();
            return true;
          })();

    const next: IFetchArguments | null = await (async () => {
      try {
        return await getFetchArguments(socket);
      } catch (exp) {
        const httpError = mapException(exp);
        const data: string =
          typeof httpError.getResponse() === "string"
            ? (httpError.getResponse() as string)
            : JSON.stringify(ErrorUtil.serialize(httpError.getResponse()));
        socket.response.writeHead(httpError.getStatus(), {
          "Content-Length": Buffer.byteLength(data),
          "Content-Type": "application/json",
        });
        socket.response.write(data);
        socket.response.end();
        return null;
      }
    })();
    if (next === null) return;

    // DO PROXY
    const result: IProxyResult = await intermediateRequest(socket)(next, body);
    try {
      await storeResult(next)(result);
    } catch {}
  };

  const isRoot = (incoming: http.IncomingMessage): boolean => {
    if (incoming.method?.toLowerCase() !== "get" || incoming.url === undefined)
      return false;
    else if (incoming.url === "/") return true;
    const elements: string[] | undefined = incoming.url
      ?.split("/")
      .filter((str) => str !== "");
    return (
      elements.length === 0 || (elements.length === 1 && elements[0][0] === "?")
    );
  };

  // const isHealthCheck = (incoming: http.IncomingMessage): boolean => {
  //   if (
  //     incoming.method?.toLowerCase() !== "get" ||
  //     !incoming.url?.startsWith("/health")
  //   )
  //     return false;
  //   else if (incoming.url === "/health") return true;
  //   const elements: string[] = incoming.url
  //     .split("/")
  //     .filter((str) => str !== "");
  //   return (
  //     elements.length === 1 &&
  //     (elements[0] === "health" || elements[0]["health".length] === "?")
  //   );
  // };

  const getFetchArguments = async (
    socket: ISocket,
  ): Promise<IFetchArguments> => {
    // VALIDATE PARAMETERS
    if (socket.request.url === undefined)
      throw ErrorProvider.internal({
        code: HubOrderGoodErrorCode.INVALID_URL,
        message: "unable to parse the url.",
      });
    else if (socket.request.method === undefined)
      throw ErrorProvider.internal({
        code: HubOrderGoodErrorCode.INVALID_HTTP_METHOD,
        message: "unable to parse the method.",
      });

    // CONSTRUCT PARAMETERS
    const params: IParameters = getParameters(
      socket.request.method ?? "GET",
      socket.request.url,
    );
    const customer: IHubCustomer | null = await (async () => {
      try {
        return await HubCustomerProvider.authorize({
          level: "citizen",
          request: socket.request,
        });
      } catch {
        return null;
      }
    })();

    // FIND RELATED RECORD
    const record = await HubGlobal.prisma.mv_hub_order_good_units.findFirst({
      where: {
        good: {
          id: params.goodId,
          order: {
            id: params.orderId,
            customer: customer
              ? HubCustomerProvider.where(customer)
              : undefined,
          },
        },
        unit: {
          id: params.unitId,
        },
      },
      include: {
        good: {
          include: {
            order: {
              include: {
                publish: true,
              },
            },
          },
        },
        unit: {
          include: {
            parameters: true,
            to_swagger: true,
          },
        },
      },
    });
    if (record === null)
      throw new NotFoundException("Unable to find the matched record");

    // VALIDATE TIMESTAMPS
    if (record.good.order.publish === null)
      throw ErrorProvider.unprocessable({
        accessor: "orderId",
        code: HubOrderPublishErrorCode.NOT_CREATED,
        message: "The order has not been not published yet.",
      });
    else if (record.good.order.cancelled_at !== null)
      throw ErrorProvider.gone({
        accessor: "orderId",
        code: HubOrderErrorCode.CANCELLED,
        message: "The order has been cancelled.",
      });
    else if (
      params.type === "real" &&
      (record.good.opened_at === null ||
        Date.now() < new Date(record.good.opened_at).getTime())
    )
      throw ErrorProvider.unprocessable({
        accessor: "goodId",
        code: HubOrderGoodErrorCode.NOT_OPENED,
        message: "The good has not been opened yet.",
      });
    else if (
      params.type === "real" &&
      record.good.closed_at !== null &&
      Date.now() >= new Date(record.good.closed_at).getTime()
    )
      throw ErrorProvider.gone({
        accessor: "goodId",
        code: HubOrderGoodErrorCode.CLOSED,
        message: "The good has been closed.",
      });

    // CONSTRUCT PATH
    const parameters: IHubSaleUnitParameter[] = record.unit.parameters
      .sort((a, b) => a.sequence - b.sequence)
      .map(HubSaleSnapshotUnitParameterProvider.json.transform);
    const queryParams: IHubSaleUnitParameter[] = parameters.filter(
      (p) => p.in === "query",
    );
    const path: string =
      queryParams.length === 0
        ? params.path
        : (() => {
            const tail: string = queryParams
              .map((p) => `${p.key}=${encodeURIComponent(p.value)}`)
              .join("&");
            return params.path.includes("?")
              ? params.path + "&" + tail
              : params.path + "?" + tail;
          })();

    // CONSTRUCT HEADERS
    const headerParams: IHubSaleUnitParameter[] = parameters.filter(
      (p) => p.in === "header",
    );
    const headers: Array<[string, string]> = Object.entries(
      socket.request.headers ?? {},
    )
      .filter(([key]) => key.toLowerCase() !== "authorization")
      .map(([key, value]) =>
        (Array.isArray(value) ? value : [value ?? ""]).map(
          (str) => [key, str] as [string, string],
        ),
      )
      .flat();
    if (headerParams.length)
      headers.push(
        ...headerParams.map((p) => [p.key, p.value] as [string, string]),
      );

    if (record.unit.to_swagger === null) {
      throw ErrorProvider.internal({
        code: CommonErrorCode.INTERNAL_SERVER_ERROR,
        message: "The swagger of the unit is not found.",
      });
    }

    return {
      host:
        params.type === "real"
          ? record.unit.to_swagger.host_real
          : (record.unit.to_swagger?.host_dev ?? ""), // TODO (Asher) : Host dev 가 없을수 있음.
      method: socket.request.method,
      path,
      headers,
      parameters: params,
      pricing: async () => {
        // @todo -> 향후 가격이 모자람에 의한 실패나,
        //          고정비 소진에 의한 추가 과금 등의 구현 필요
        await HubGlobal.prisma.mv_hub_order_good_unit_prices.update({
          data: {
            count: {
              decrement: 1,
            },
          },
          where: {
            hub_order_good_id_hub_sale_snapshot_unit_id: {
              hub_order_good_id: record.hub_order_good_id,
              hub_sale_snapshot_unit_id:
                record.hub_sale_snapshot_unit_origin_id,
            },
          },
        });
      },
    };
  };

  const getParameters = (method: string, url: string): IParameters => {
    const p = splatPath.test(url) ?? rootPath.test(url);
    if (p === null)
      throw ErrorProvider.notFound({
        code: HubOrderGoodErrorCode.INVALID_URL,
        message: `Cannot ${method.toUpperCase()} ${url}`,
      });
    const callId: string | undefined = (() => {
      const question: number = url.lastIndexOf("?");
      if (question === -1) return undefined;
      const start: number = url.lastIndexOf("hub_call_id=", question + 1);
      if (start === -1) return undefined;
      const last: number = url.indexOf("&", start + 12);
      return last === -1 ? url.slice(start + 12) : url.slice(start + 12, last);
    })();
    try {
      return typia.assert<IParameters>({
        ...p,
        path: p.path ? `/${p.path}` : "/",
        callId,
      });
    } catch (exp) {
      if (typia.is<TypeGuardError>(exp))
        throw ErrorProvider.badRequest({
          accessor: exp.path ?? "unknown",
          code: HubOrderGoodErrorCode.INVALID_URL,
          message: `invalid ${exp.path} type.`,
        });
      else throw exp;
    }
  };

  const intermediateRequest =
    (socket: ISocket) =>
    async (props: IFetchArguments, body: boolean): Promise<IProxyResult> => {
      const output: IProxyResult = {
        created_at: new Date(),
        respond_at: null,
        status: null,
      };

      // eslint-disable-block
      try {
        // DO REQUEST
        const remote: Response = await fetch(`${props.host}${props.path}`, {
          method: props.method,
          headers: props.headers,
          ...(body
            ? {
                body: StreamUtil.incomingToReadable(socket.request),
                duplex: "half",
              }
            : {}),
        } as RequestInit);

        // STATUS AND HEADER
        output.status = remote.status;
        socket.response.writeHead(
          remote.status,
          remote.statusText,
          Object.fromEntries(
            [...remote.headers.entries()].filter(
              ([key]) => false === CORS_KEYS.has(key.toLowerCase()),
            ),
          ),
        );

        // DELIVER BODY DATA
        if (remote.body) {
          const reader: ReadableStreamDefaultReader<Uint8Array> =
            remote.body.getReader();
          while (true) {
            const piece = await reader.read();
            if (piece.value) socket.response.write(piece.value);
            if (piece.done) break;
          }
        }
        socket.response.end();
      } catch (exp) {
        try {
          socket.response.destroy();
        } catch {}
      }
      return output;
    };

  const storeResult =
    (next: IFetchArguments) =>
    async (result: IProxyResult): Promise<void> => {
      await HubGlobal.prisma.hub_order_good_calls.create({
        data: {
          id: next.parameters?.callId ?? v4(),
          hub_order_good_id: next.parameters.goodId,
          hub_sale_snapshot_unit_id: next.parameters.unitId,
          method: next.method,
          path: next.path,
          status: result.status,
          created_at: result.created_at,
          respond_at: result.respond_at,
        },
      });
      if (result.status === 200 || result.status === 201) await next.pricing();
    };

  const mapException = (exp: unknown): HttpException => {
    if (exp instanceof HttpException) return exp;
    if (exp instanceof PrismaClientKnownRequestError)
      switch (exp.code) {
        case "P2025":
          return ErrorProvider.notFound({
            code: HubOrderGoodErrorCode.INVALID_URL,
            message: exp.message,
          });
        case "P2002": // UNIQUE CONSTRAINT
          return ErrorProvider.conflict({
            code: HubOrderGoodErrorCode.INVALID_URL,
            message: exp.message,
          });
        default:
          return ErrorProvider.internal({
            code: HubOrderGoodErrorCode.INVALID_URL,
            message: exp.message,
          });
      }
    return new InternalServerErrorException(exp);
  };
}

interface IParameters {
  callId?: string & tags.Format<"uuid">;
  orderId: string & tags.Format<"uuid">;
  goodId: string & tags.Format<"uuid">;
  unitId: string & tags.Format<"uuid">;
  type: "real" | "dev";
  path: string;
}

interface IFetchArguments {
  host: string;
  method: string;
  path: string;
  headers: Array<[string, string]>;
  parameters: IParameters;
  pricing: () => Promise<void>;
}

interface IProxyResult {
  created_at: Date;
  respond_at: Date | null;
  status: number | null;
}

const CORS_KEYS: Set<string> = new Set([
  "access-control-allow-origin",
  "access-control-request-method",
  "access-control-allow-methods",
  "access-control-allow-headers",
  "access-control-allow-credentials",
  "access-control-max-age",
]);

const splatPath = new Path(
  "/hub/customers/orders/:orderId/goods/:goodId/api/:type/units/:unitId/*path",
);
const rootPath = new Path(
  "/hub/customers/orders/:orderId/goods/:goodId/api/:type/units/:unitId",
);
