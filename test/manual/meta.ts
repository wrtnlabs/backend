import { ChatGptTypeChecker, IChatGptSchema } from "@samchon/openapi";
import chalk from "chalk";
import fs from "fs";
import * as inquirer from "inquirer";
import { MutexServer } from "mutex-server";
import { sleep_for } from "tstl";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IStudioMetaChatListener } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatListener";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";

import { HubBackend } from "../../src/HubBackend";
import { HubConfiguration } from "../../src/HubConfiguration";
import { HubGlobal } from "../../src/HubGlobal";
import { HubMutex } from "../../src/HubMutex";
import { HubSetupWizard } from "../../src/setup/HubSetupWizard";
import { PaymentSetupWizard } from "../../src/setup/PaymentSetupWizard";
import { ArgumentParser } from "../../src/utils/ArgumentParser";
import { ConsoleScanner } from "../../src/utils/ConsoleScanner";
import { StopWatch } from "../../src/utils/StopWatch";
import "../../src/utils/Tracer";
import { ConnectionPool } from "../ConnectionPool";
import { test_api_hub_admin_login } from "../features/api/hub/actors/test_api_hub_admin_login";
import { test_api_hub_customer_join } from "../features/api/hub/actors/test_api_hub_customer_join";
import { generate_random_cart_commodity } from "../features/api/hub/carts/internal/generate_random_cart_commodity";
import { generate_random_order } from "../features/api/hub/orders/internal/generate_random_order";
import { generate_random_order_publish } from "../features/api/hub/orders/internal/generate_random_order_publish";

interface IOptions {
  reset: boolean;
  language: string;
}

const getOptions = () =>
  ArgumentParser.parse<IOptions>(async (command, prompt, action) => {
    command.option("--reset <true|false>", "reset local DB or not");
    command.option("--debug <true|false>", "debug mode or not");
    command.option("--language <string>", "language code");
    return action(async (options) => {
      if (typeof options.reset === "string")
        options.reset = options.reset === "true";
      options.reset ??= await prompt.boolean("reset")("Reset local DB");
      options.language ??= await prompt.select("language")("Language code")([
        "en",
        "ko",
      ]);
      return options as IOptions;
    });
  });

const selectSale = async (pool: ConnectionPool): Promise<IHubSale> => {
  await test_api_hub_admin_login(pool);
  const page: IPage<IHubSale> =
    await HubApi.functional.hub.admins.sales.details(pool.admin, {
      limit: 1_000,
      search: {
        seller: {
          email: HubGlobal.env.STORE_EMAIL,
        },
      },
    });
  const selected = await inquirer.createPromptModule()({
    type: "list",
    name: "sale",
    message: "Select a sale to provider",
    choices: page.data.map((sale) => sale.content.title),
  });
  const title: string = selected.sale;
  return page.data.find((sale) => sale.content.title === title)!;
};

const fillArgument = (schema: IChatGptSchema): any => {
  trace("FILL ARGUMENT", JSON.stringify(schema, null, 2));
  if (ChatGptTypeChecker.isString(schema))
    if (schema.description?.includes("@contentMediaType") !== undefined)
      return "https://namu.wiki/w/%EB%A6%B4%ED%8C%8C";
    else if (schema["x-wrtn-secret-key"] === "google") {
      console.log("Here is the google secret key");
      return HubGlobal.env.TEST_GOOGLE_SECRET_KEY ?? "NOT_SPECIFIED";
    }
    else return "Hello word";
  else if (ChatGptTypeChecker.isNumber(schema)) return 123;
  else if (ChatGptTypeChecker.isBoolean(schema)) return true;
  else if (ChatGptTypeChecker.isArray(schema))
    return new Array(1).fill(0).map(() => fillArgument(schema.items));
  else if (ChatGptTypeChecker.isObject(schema)) {
    const obj: any = {};
    for (const [key, value] of Object.entries(schema.properties ?? {}))
      obj[key] = fillArgument(value);
    console.log("Filled object", obj);
    return obj;
  } else {
    trace("INVALID SCHEMA", schema);
    throw new Error("Invalid schema");
  }
};

const trace = (...args: any[]): void => {
  console.log("----------------------------------------------");
  console.log(...args);
  console.log("----------------------------------------------");
};

const main = async (): Promise<void> => {
  if (HubGlobal.env.TEST_GOOGLE_SECRET_KEY === undefined)
    throw new Error("env.TEST_GOOGLE_SECRET_KEY is not specified");

  // SETUP
  HubGlobal.testing = true;
  const options: IOptions = await getOptions();
  if (options.reset || !PaymentSetupWizard.prepared())
    await StopWatch.trace("Payment Server")(() => PaymentSetupWizard.setup());
  if (options.reset) {
    await StopWatch.trace("Reset DB")(HubSetupWizard.schema);
    await StopWatch.trace("Seed Data")(HubSetupWizard.seed);
  }

  const backend: HubBackend = new HubBackend();
  const mutex: MutexServer<HubMutex.IHeader> = await HubMutex.master();
  await backend.open();

  (async () => {
    const location: string = `${HubConfiguration.ROOT}/meta.memory.log.md`;
    const memories: NodeJS.MemoryUsage[] = [];
    const line = (
      title: string,
      getter: (m: NodeJS.MemoryUsage) => number,
    ): string =>
      `line "${title}" [${memories.map((m) => Math.floor(getter(m) / 1024 ** 2)).join(", ")}]`;
    while (true) {
      await sleep_for(1_000);
      memories.push(process.memoryUsage());
      const content: string = [
        "```mermaid",
        "xychart-beta",
        `  x-axis "Time (second)"`,
        `  y-axis "Memory (MB)"`,
        `  ${line("Resident Set Size", (m) => m.rss)}`,
        `  ${line("Heap Total", (m) => m.heapTotal)}`,
        `  ${line("Heap Used", (m) => m.heapUsed)}`,
        `  ${line("External", (m) => m.external)}`,
        `  ${line("ArrayBuffers", (m) => m.arrayBuffers)}`,
        "```",
        "",
        `> - 🟦 Resident Set Size`,
        `> - 🟢 Heap Total`,
        `> - 🔴 Heap Used`,
        `> - 🟡 External`,
        `> - 🟣 ArrayBuffers`,
      ].join("\n");
      await fs.promises.writeFile(location, content, "utf8");
    }
  })().catch(() => {});

  const pool: ConnectionPool = new ConnectionPool({
    host: `http://127.0.0.1:${HubConfiguration.API_PORT()}`,
  });
  await test_api_hub_customer_join(
    pool,
    undefined,
    undefined,
    undefined,
    options.language,
  );

  const sale: IHubSale = await selectSale(pool);
  const commodity: IHubCartCommodity = await generate_random_cart_commodity(
    pool,
    sale,
  );
  const order: IHubOrder = await generate_random_order(pool, [commodity]);
  order.publish = await generate_random_order_publish(pool, order, {
    opened_at: new Date().toISOString(),
    closed_at: null,
  });
  console.log("Order Published");

  const { connector, driver } =
    await HubApi.functional.studio.customers.meta.chat.sessions.start(
      pool.customer,
      {
        mock: process.argv.includes("--mock"),
        good_ids: [order.goods[0].id],
      },
      {
        initialize: async () => {},
        talk: async (dialogue) => {
          trace(
            chalk.greenBright("StudioMetaChatListener.talk()\n\n"),
            dialogue.text,
          );
        },
        selectFunction: async (props) => {
          trace(
            chalk.blueBright("StudioMetaChatListener.selectFunction()\n\n"),
            props.operation.name,
            props.reason,
          );
        },
        cancelFunction: async (props) => {
          trace(
            chalk.blueBright("StudioMetaChatListener.cancelFunction()\n\n"),
            props.operation.name,
            props.reason,
          );
        },
        fillArguments: async (props) => {
          trace(
            chalk.blueBright("StudioMetaChatListener.fillArgument()\n\n"),
            props.parameters,
          );
          return {
            determinant: "accept",
            arguments: fillArgument(props.parameters) as Record<string, any>,
          };
        },
        completeFunction: async (props) => {
          trace(
            chalk.blueBright("StudioMetaChatListener.completeFunction()\n\n"),
            props.arguments,
            props.value,
          );
        },
        describeFunctionCalls: async (props) => {
          trace(
            chalk.blueBright(
              "StudioMetaChatListener.describeFunctionCalls()\n\n",
            ),
            props.text,
          );
        },
      } satisfies IStudioMetaChatListener,
    );
  console.log("Connected");

  const session: IStudioMetaChatSession = await driver.initialize({});
  console.log("session.id", session.id);
  trace(chalk.redBright("CONNECTED"));

  while (true) {
    const text: string = await ConsoleScanner.read("Input: ");
    if (text === "exit") break;
    await driver.talk({
      type: "text",
      text,
    });
  }

  await connector.close();
  await backend.close();
  await mutex.close();
  trace(chalk.redBright("EVERYTHING COMPLETED"));
};
main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
