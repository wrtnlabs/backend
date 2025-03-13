import { Params } from "nestjs-pino";

import { HubGlobal } from "../HubGlobal";

export const pinoLoggerParams: Params = {
  pinoHttp: {
    autoLogging: false, // autologging을 true면 모든 request, response에 대한 로깅이 자동으로 됨.
    redact: {
      // 자동으로 모든 로그에 해당 req, res metadata가 다 찍힘.
      paths: ["req", "res"],
      remove: true,
    },
    level: HubGlobal.env.HUB_MODE === "local" ? "debug" : "info",
    base: null,
    transport:
      HubGlobal.env.HUB_MODE === "local"
        ? {
            target: "pino-pretty",
            options: {
              translateTime: "SYS:yyyy-mm-dd hh:MM:ss",
              customLevels: "data:35",
              customColors: "data:cyan",
              useOnlyCustomProps: false,
            },
          }
        : undefined,
    formatters: {
      level(label) {
        return { level: label === "trace" ? "data" : label };
      },
      log(info: Record<string, any>) {
        return info;
      },
    },
    messageKey: "message",
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
    customLevels: {
      error: 50,
      warn: 40,
      data: 35, // custom
      trace: 35, // custom (logger.verbose -> trace -> data)
      info: 30,
      debug: 20,
    },
    useOnlyCustomLevels: true,
  },
};
