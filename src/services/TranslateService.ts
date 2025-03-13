import { JsonTranslator } from "@samchon/json-translator";
import { Singleton } from "tstl";

import { HubGlobal } from "../HubGlobal";

export class TranslateService {
  public static get api(): JsonTranslator {
    return singleton.get();
  }
}

const singleton = new Singleton(() => {
  if (HubGlobal.env.GOOGLE_APPLICATION_CREDENTIALS === undefined)
    throw new Error("env.GOOGLE_APPLICATION_CREDENTIALS is not defined");
  return new JsonTranslator({
    credentials: JSON.parse(HubGlobal.env.GOOGLE_APPLICATION_CREDENTIALS),
  });
});
