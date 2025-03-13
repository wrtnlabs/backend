import { OpenApi } from "@samchon/openapi";
import typia from "typia";

import { IHubSaleUnitParameter } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitParameter";

export namespace HubSaleUnitParameterDiagnoser {
  export const prune = (
    swagger: OpenApi.IDocument,
    parameters: IHubSaleUnitParameter[],
  ): OpenApi.IDocument => {
    //----
    // DEFAULT AUTHORIZATION
    //----
    if (parameters === undefined) return swagger;
    pruneAuthorization(swagger);

    //----
    // CUSTOM PARAMETERS
    //----
    for (const param of parameters) {
      // SECURITY
      const keywords: string[] = Object.entries(
        swagger.components.securitySchemes ?? {},
      )
        .filter(
          ([_key, security]) =>
            security.type === "apiKey" &&
            security.in === param.in &&
            security.name === param.key,
        )
        .map(([key]) => key);
      if (keywords.length) {
        const set: Set<string> = new Set(keywords);
        if (swagger.security) pruneSecurity(set)(swagger.security);
        for (const collection of Object.values(swagger.paths ?? {}))
          for (const [k, route] of Object.entries(collection))
            if (
              typia.is<OpenApi.Method>(k) &&
              !typia.is<string>(route) &&
              route.security !== undefined
            )
              pruneSecurity(set)(route.security);
      }

      // ROUTES
      for (const collection of Object.values(swagger.paths ?? []))
        for (const [k, route] of Object.entries(collection))
          if (typia.is<OpenApi.Method>(k) && !typia.is<string>(route))
            pruneParameters(param.in)(new Set([param.key]))(route);
    }

    //----
    // SECURITY
    //----
    swagger.components.securitySchemes ??= {};
    swagger.components.securitySchemes["__hub_Authorization"] = {
      type: "apiKey",
      in: "header",
      name: "Authorization",
    };
    for (const collection of Object.values(swagger.paths ?? {}))
      for (const [k, route] of Object.entries(collection))
        if (typia.is<OpenApi.Method>(k) && !typia.is<string>(route)) {
          route.security ??= [];
          route.security.push({
            __hub_Authorization: [],
          });
        }
    return swagger;
  };

  const pruneAuthorization = (swagger: OpenApi.IDocument) => {
    if (swagger.components.securitySchemes === undefined) return;

    const keywords: Set<string> = new Set();
    for (const [key, security] of Object.entries(
      swagger.components.securitySchemes,
    )) {
      const isAuthorization: boolean =
        (security.type === "http" &&
          (security.scheme === "basic" || security.scheme === "bearer")) ||
        (security.type === "apiKey" &&
          security.in === "header" &&
          security.name?.toLowerCase() === "authorization");
      if (isAuthorization) {
        keywords.add(key);
        delete swagger.components.securitySchemes[key];
      }
    }
    if (keywords.size === 0) return;

    if (swagger.security) pruneSecurity(keywords)(swagger.security);
    for (const collection of Object.values(swagger.paths ?? {}))
      for (const [k, route] of Object.entries(collection))
        if (typia.is<OpenApi.Method>(k) && !typia.is<string>(route)) {
          if (route.security !== undefined)
            pruneSecurity(keywords)(route.security);
          pruneParameters("header")(new Set(["authorization"]))(route);
        }
  };

  const pruneSecurity =
    (keywords: Set<string>) =>
    (array: Record<string, string[]>[]): void => {
      for (const dict of array)
        for (const key of Object.keys(dict))
          if (keywords.has(key)) delete dict[key];
      // eslint-disable-next-line
      for (let i: number = array.length - 1; i >= 0; i--)
        if (Object.keys(array[i]).length === 0) array.splice(i, 1);
    };

  const pruneParameters =
    (type: "path" | "query" | "header" | "cookie") =>
    (keywords: Set<string>) =>
    (route: OpenApi.IOperation): void => {
      if (route.parameters === undefined) return;
      route.parameters = route.parameters.filter(
        (p) =>
          !(
            p.in === type &&
            p.name !== undefined &&
            keywords.has(p.in === "header" ? p.name.toLowerCase() : p.name)
          ),
      );
    };
}
