import { TestValidator } from "@nestia/e2e";
import { ChatGptTypeChecker, IChatGptSchema } from "@samchon/openapi";
import { randint } from "tstl";
import typia, { tags } from "typia";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";
import { IStudioMetaChatListener } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatListener";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";

import { ConnectionPool } from "../../../../../ConnectionPool";

export const validate_api_studio_meta_chat_session = async (
  _pool: ConnectionPool,
  _account: IStudioAccount,
  operation: (
    listener: IStudioMetaChatListener,
  ) => Promise<HubApi.functional.studio.customers.meta.chat.sessions.start.Output>,
): Promise<IStudioMetaChatSession> => {
  const checkers = {
    select: false,
    fill: false,
    complete: false,
    describe: false,
  };
  const { connector, driver } = await operation({
    talk: async (dialogue) => {
      typia.assert(dialogue);
    },
    selectFunction: async (props) => {
      typia.assert(props);
      checkers.select = true;
    },
    cancelFunction: async () => {},
    fillArguments: async (props) => {
      typia.assert<{
        body: {
          to: Array<string & tags.Format<"email">>;
          subject: string;
          body: string;
        };
      }>(props.llm?.arguments);
      checkers.fill = true;
      return {
        determinant: "accept",
        arguments: fillArgument(props.parameters),
      };
    },
    completeFunction: async (props) => {
      TestValidator.equals("success")(props.status)(201);
      checkers.complete = true;
    },
    describeFunctionCalls: async (props) => {
      typia.assert(props);
      checkers.describe = true;
    },
  });
  const session: IStudioMetaChatSession = await driver.initialize();
  const conversate = (text: string) =>
    driver.talk({
      type: "text",
      text,
    });
  await conversate("이메일을 보내주세요.");
  await conversate(
    [
      "받는 사람: jaxtyn@wrtn.io",
      "제목: 안녕하세요?",
      "본문: 반갑습니다!",
    ].join("\n"),
  );
  await conversate("네, 그대로 이메일을 보내주세요.");

  await connector.close();
  TestValidator.equals("checkers")(true)(
    checkers.select && checkers.fill && checkers.complete && checkers.describe,
  );
  return session;
};

const fillArgument = (schema: IChatGptSchema): any => {
  if (ChatGptTypeChecker.isString(schema))
    if (schema.description?.includes("@contentMediaType"))
      return "https://wrtn.io/logo.png";
    else if (schema["x-wrtn-secret-key"] !== undefined)
      return "1//0e2dUw_k3h8U9CgYIARAAGA4SNwF-L9IrEjQBMpqfdlJJFD5VGhuY3QNu-iSOPWgSUngiT3Vn5zr_CzrbogmHBrqLS_7YUF6IOZs";
    else return "Hello word";
  else if (ChatGptTypeChecker.isNumber(schema)) return 123;
  else if (ChatGptTypeChecker.isBoolean(schema)) return true;
  else if (ChatGptTypeChecker.isArray(schema))
    return new Array(randint(0, 3)).fill(0).map(fillArgument);
  else if (ChatGptTypeChecker.isObject(schema)) {
    const obj: any = {};
    for (const [key, value] of Object.entries(schema.properties ?? {}))
      obj[key] = fillArgument(value);
    return obj;
  } else {
    throw new Error("Invalid schema");
  }
};
