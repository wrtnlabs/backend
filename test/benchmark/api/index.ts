import fs from "fs";
import os from "os";
import path from "path";
import { Driver, WorkerConnector } from "tgrid";
import { sleep_for } from "tstl";

import { HubConfiguration } from "../../../src/HubConfiguration";
import { ArgumentParser } from "../../../src/utils/ArgumentParser";
import { Benchmarker } from "./Benchmarker";
import { IBenchmarkBackend } from "./IBenchmarkBackend";

interface IOptions {
  reset: boolean;
  include?: string[];
  exclude?: string[];
  trace: boolean;
  mock_llm: boolean;
  count: number;
  threads: number;
  simultaneous: number;
  custom_prefix?: string;
}

const getOptions = () =>
  ArgumentParser.parse<IOptions>(async (command, prompt, action) => {
    command.option("--reset <true|false>", "reset local DB or not");
    command.option("--include <string...>", "include feature files");
    command.option("--exclude <string...>", "exclude feature files");
    command.option("--trace <boolean>", "trace detailed errors");
    command.option("--mock_llm <boolean>", "mock LLM api for faster testing");
    command.option("--count <number>", "number of requests to make");
    command.option("--threads <number>", "number of threads to use");
    command.option(
      "--simultaneous <number>",
      "number of simultaneous requests to make",
    );
    command.option("--custom_prefix <string>", "custom prefix for test files");
    command.option("--pool <number>", "number of compilers to use");

    return action(async (options) => {
      if (typeof options.reset === "string")
        options.reset = options.reset === "true";
      options.reset ??= await prompt.boolean("reset")("Reset local DB");
      options.trace = options.trace !== ("false" as any);
      options.mock_llm = options.mock_llm !== ("false" as any);
      options.count = Number(
        options.count ??
          (await prompt.number("count")("Number of requests to make")),
      );
      options.threads = Number(
        options.threads ??
          (await prompt.number("threads")("Number of threads to use")),
      );
      options.simultaneous = Number(
        options.simultaneous ??
          (await prompt.number("simultaneous")(
            "Number of simultaneous requests to make",
          )),
      );
      if (!options.mock_llm) {
        console.log("Using actual OpenAI API for testing");
        console.log("-- beware OpenAI apis incur costs and may be slow");
      } else {
        console.log("Using mocked OpenAI API for testing");
        console.log(
          "-- run with real API at least once when before finalizing changes to LLM logic",
        );
      }
      return options as IOptions;
    });
  });

const main = async (): Promise<void> => {
  // CLEAR BENCHMARK FILE
  const directory: string = `${HubConfiguration.ROOT}/docs/benchmarks/api`;
  const location: string = path.resolve(
    `${directory}/${os
      .cpus()[0]
      .model.trim()
      .split("\\")
      .join("")
      .split("/")
      .join("")}.md`,
  );

  // OPEN SERVER
  const options: IOptions = await getOptions();
  const backend: WorkerConnector<null, null, IBenchmarkBackend> =
    new WorkerConnector(null, null, "process");
  await backend.connect(`${__dirname}/backend.js`, {
    stdio: "ignore",
  });
  const driver: Driver<IBenchmarkBackend> = await backend.getDriver();
  await driver.open(options);

  // DO BENCHMARK
  const markdown: string = await Benchmarker.execute({
    ...options,
    filter: (name) =>
      false === name.includes("seed") &&
      false === name.includes("timeout") &&
      false === name.includes("terminate") &&
      (!options.include?.length ||
        (options.include ?? []).some((str) => name.includes(str))) &&
      (!options.exclude?.length ||
        (options.exclude ?? []).every((str) => !name.includes(str))),
    memory: () => driver.memory(),
  });

  // DOCUMENTATION
  try {
    await fs.promises.mkdir(directory, { recursive: true });
  } catch {}
  await fs.promises.writeFile(location, markdown, "utf8");
  console.log(`Benchmark report on ${JSON.stringify(location)}`);

  // TERMINATE
  await sleep_for(2_500); // WAIT FOR BACKGROUND EVENTS
  await driver.close();
  await backend.close();
};
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
