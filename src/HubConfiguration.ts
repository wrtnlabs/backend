import { ExceptionManager } from "@nestia/core";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import "@wrtnlabs/schema";
import fs from "fs";
import path from "path";
import { Singleton } from "tstl";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";

import { ErrorProvider } from "./providers/common/ErrorProvider";

import { HubGlobal } from "./HubGlobal";

const EXTENSION = __filename.substr(-2);
if (EXTENSION === "js") require("source-map-support").install();

export namespace HubConfiguration {
  export const DIRECTORY = (() => {
    const split: string[] = __dirname.split(path.sep);
    if (split.at(-1) === "src" && split.at(-2) === "bin") return "test";
    else if (fs.existsSync(__dirname + "/.env")) return "dist";
    return "src";
  })();

  export const ROOT = (() =>
    DIRECTORY === "test"
      ? path.resolve(__dirname + "/../..")
      : DIRECTORY === "dist"
        ? __dirname
        : path.resolve(__dirname + "/.."))();

  export const API_PORT = () => Number(HubGlobal.env.HUB_API_PORT);
  export const API_HOST = () =>
    HubGlobal.env.HUB_API_HOST ?? `http://127.0.0.1:${API_PORT()}`;

  export const DB_CONFIG = () => ({
    type: "postgres" as const,
    username: HubGlobal.env.HUB_POSTGRES_USERNAME ?? "",
    readonlyUsername: HubGlobal.env.HUB_POSTGRES_USERNAME_READONLY,
    password: HubGlobal.env.HUB_POSTGRES_PASSWORD ?? "",
    host: HubGlobal.env.HUB_POSTGRES_HOST ?? "",
    port: Number(HubGlobal.env.HUB_POSTGRES_PORT),
    database: HubGlobal.env.HUB_POSTGRES_DATABASE ?? "",
    schema: HubGlobal.env.HUB_POSTGRES_SCHEMA ?? "",
    url: HubGlobal.env.HUB_POSTGRES_URL ?? "",
  });

  export const freeTalkingLimit = new Singleton(() =>
    Number(HubGlobal.env.FREE_TALKING_LIMIT) >= 0
      ? Number(HubGlobal.env.FREE_TALKING_LIMIT)
      : 0,
  );
}

ExceptionManager.insert(PrismaClientKnownRequestError, (exp) => {
  switch (exp.code) {
    case "P2025":
      return ErrorProvider.notFound({
        message: exp.message,
        code: CommonErrorCode.RECORD_NOT_FOUND,
      });
    case "P2002": // UNIQUE CONSTRAINT
      return ErrorProvider.conflict({
        message: exp.message,
        code: CommonErrorCode.UNIQUE_CONSTRAINT_VIOLATED,
      });
    default:
      return ErrorProvider.internal({
        message: exp.message,
        code: CommonErrorCode.INTERNAL_PRISMA_ERROR,
      });
  }
});
