import { DynamicExecutor, RandomGenerator } from "@nestia/e2e";
import chalk from "chalk";
import { sleep_for } from "tstl";

import { IHubChannel } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannel";

import { HubChannelProvider } from "../src/providers/hub/systematic/HubChannelProvider";

import { HubConfiguration } from "../src/HubConfiguration";
import { HubGlobal } from "../src/HubGlobal";
import HubApi from "../src/api";
import { HubSetupWizard } from "../src/setup/HubSetupWizard";
import { PaymentSetupWizard } from "../src/setup/PaymentSetupWizard";
import { ArgumentParser } from "../src/utils/ArgumentParser";
import { StopWatch } from "../src/utils/StopWatch";
import { ConnectionPool } from "./ConnectionPool";

export namespace TestAutomation {
  export interface IProps<T> {
    open(options: IOptions): Promise<T>;
    close(backend: T): Promise<void>;
  }

  export interface IOptions {
    reset: boolean;
    include?: string[];
    exclude?: string[];
    trace: boolean;
    mock: boolean;
    simultaneous: number;
  }

  export const execute = async <T>(props: IProps<T>): Promise<void> => {
    // CONFIGURE
    const options: IOptions = await getOptions();

    HubGlobal.testing = true;
    HubGlobal.mock = options.mock;

    if (options.reset || !PaymentSetupWizard.prepared())
      await StopWatch.trace("Payment Server")(() => PaymentSetupWizard.setup());
    if (options.reset) {
      await StopWatch.trace("Reset DB")(HubSetupWizard.schema);
      await StopWatch.trace("Seed Data")(HubSetupWizard.seed);
    }

    // DO TEST
    const backend: T = await props.open(options);
    const connection: HubApi.IConnection = {
      host: `http://127.0.0.1:${HubConfiguration.API_PORT()}`,
    };
    const report: DynamicExecutor.IReport = await DynamicExecutor.validate({
      prefix: "test",
      location: __dirname + "/features",
      filter: (func) =>
        (!options.include?.length ||
          (options.include ?? []).some((str) => func.includes(str))) &&
        (!options.exclude?.length ||
          (options.exclude ?? []).every((str) => !func.includes(str))),
      parameters: () => [new ConnectionPool(connection)],
      onComplete: (exec) => {
        const trace = (str: string) =>
          console.log(`  - ${chalk.green(exec.name)}: ${str}`);
        if (exec.error === null) {
          const elapsed: number =
            new Date(exec.completed_at).getTime() -
            new Date(exec.started_at).getTime();
          trace(`${chalk.yellow(elapsed.toLocaleString())} ms`);
        } else trace(chalk.red(exec.error.name));
      },
      simultaneous: options.simultaneous,
      wrapper: async (_name, closure, parameters) => {
        const [pool] = parameters;
        const channel: IHubChannel = await HubChannelProvider.create({
          code: pool.channel,
          name: RandomGenerator.name(8),
        });
        try {
          return await closure(...parameters);
        } catch (error) {
          throw error;
        } finally {
          await HubChannelProvider.destroy(channel.id);
        }
      },
    });

    // TERMINATE - WAIT FOR BACKGROUND EVENTS
    await sleep_for(2500);
    await props.close(backend);

    const exceptions: Error[] = report.executions
      .filter((exec) => exec.error !== null)
      .map((exec) => exec.error!);
    if (exceptions.length === 0) {
      console.log("Success");
      console.log("Elapsed time", report.time.toLocaleString(), `ms`);
    } else {
      if (options.trace !== false)
        for (const exp of exceptions) console.log(exp);
      console.log("Failed");
      console.log("Elapsed time", report.time.toLocaleString(), `ms`);
      process.exit(-1);
    }
  };
}

const getOptions = () =>
  ArgumentParser.parse<TestAutomation.IOptions>(
    async (command, prompt, action) => {
      command.option("--reset <true|false>", "reset local DB or not");
      command.option(
        "--simultaneous <number>",
        "number of simultaneous requests",
      );
      command.option("--include <string...>", "include feature files");
      command.option("--exclude <string...>", "exclude feature files");
      command.option("--trace <boolean>", "trace detailed errors");
      command.option("--mock <boolean>", "mock LLM api by cost reason");

      return action(async (options) => {
        if (typeof options.reset === "string")
          options.reset = options.reset === "true";
        options.reset ??= await prompt.boolean("reset")("Reset local DB");
        options.trace = options.trace !== ("false" as any);
        options.mock = options.mock !== ("false" as any);
        options.simultaneous = Number(
          options.simultaneous ?? options.simultaneous === 1,
        );
        if (isNaN(options.simultaneous)) options.simultaneous = 1;
        return options as TestAutomation.IOptions;
      });
    },
  );
