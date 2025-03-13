import { SwaggerCustomizer } from "@nestia/core";
import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { VariadicSingleton } from "tstl";

import { HubCustomerProvider } from "../providers/hub/actors/HubCustomerProvider";

export const HubCustomerAuth =
  (level?: "member" | "citizen"): ParameterDecorator =>
  (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ): void => {
    SwaggerCustomizer((props) => {
      props.route.security ??= [];
      props.route.security.push({
        bearer: [],
      });
    })(target, propertyKey as string, undefined!);
    singleton.get(level ?? "guest")(target, propertyKey, parameterIndex);
  };

const singleton = new VariadicSingleton(
  (level: "guest" | "member" | "citizen") =>
    createParamDecorator(async (_0: any, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      return HubCustomerProvider.authorize({
        level,
        request,
      });
    })(),
);
