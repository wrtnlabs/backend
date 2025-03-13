import {
  ArgumentsHost,
  Catch,
  HttpException,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { BaseExceptionFilter } from "@nestjs/core";

import { JwtTokenService } from "../services/JwtTokenService";
import { ErrorUtil } from "../utils/ErrorUtil";

interface IResponse {
  req: any;
  customer_id: string | null;
  err: any;
}

@Catch()
export class HttpExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  public async catch(exception: HttpException | Error, host: ArgumentsHost) {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const req = ctx.getRequest();
    const statusCode: number =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const error: IResponse = {
      req: {
        method: req.method,
        url: req.url ?? null,
        body: req.body ?? null,
        query: req.query ?? null,
        params: req.params ?? null,
        headers: req.headers ?? null,
      },
      customer_id:
        req.headers.authorization !== undefined
          ? await this.getCustomerId(req.headers.authorization)
          : null,
      err: ErrorUtil.serialize(exception),
    };

    if (statusCode >= 500 && statusCode < 600) {
      this.logger.error(exception, error);
    } else {
      this.logger.log(JSON.stringify(error));
    }

    if (!(exception instanceof HttpException)) {
      exception = new InternalServerErrorException(exception);
    }
    return super.catch(exception, host);
  }

  private async getCustomerId(token: string): Promise<string | null> {
    try {
      const verify = await JwtTokenService.authorize({
        table: "hub_customers",
        request: {
          headers: {
            authorization: token,
          },
        },
      });
      return verify.id;
    } catch (e) {
      return null;
    }
  }
}
