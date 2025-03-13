import { IHttpLlmApplication, OpenApi } from "@samchon/openapi";
import { WebSocketAcceptor } from "tgrid";

import { IAuthorization } from "../../common/IAuthorization";
import { IHubCustomer } from "../../hub/actors/IHubCustomer";
import { IStudioMetaChatListener } from "./IStudioMetaChatListener";
import { IStudioMetaChatService } from "./IStudioMetaChatService";
import { IStudioMetaChatSession } from "./IStudioMetaChatSession";
import { IStudioMetaChatSessionConnection } from "./IStudioMetaChatSessionConnection";

export interface IStudioMetaChatServiceProps {
  customer: IHubCustomer;
  acceptor: WebSocketAcceptor<
    IAuthorization,
    IStudioMetaChatService,
    IStudioMetaChatListener
  >;
  listener: IStudioMetaChatListener;
  session: IStudioMetaChatSession;
  connection: IStudioMetaChatSessionConnection;
  controllers: IStudioMetaChatServiceProps.IController[];
  restart: boolean;
  timezone?: string;
}
export namespace IStudioMetaChatServiceProps {
  export interface IController {
    swagger: OpenApi.IDocument;
    application: IHttpLlmApplication<"chatgpt">;
  }
}
