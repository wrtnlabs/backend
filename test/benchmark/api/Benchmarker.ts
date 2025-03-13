import { DynamicBenchmarker } from "@nestia/benchmark";
import cliProgress from "cli-progress";
import { IPointer } from "tstl";

export namespace Benchmarker {
  export interface IProps {
    count: number;
    simultaneous: number;
    threads: number;
    filter?: (name: string) => boolean;
    memory?: () => Promise<NodeJS.MemoryUsage>;
  }

  export const execute = async (props: IProps): Promise<string> => {
    const prev: IPointer<number> = { value: 0 };
    const bar = new cliProgress.SingleBar(
      {},
      cliProgress.Presets.shades_classic,
    );
    bar.start(props.count, 0);

    const report: DynamicBenchmarker.IReport = await DynamicBenchmarker.master({
      count: props.count,
      threads: props.threads,
      simultaneous: props.simultaneous,
      filter: props.filter,
      progress: (value: number) => {
        if (value >= 100 + prev.value) {
          bar.update(value);
          prev.value = value;
        }
      },
      memory: props.memory,
      stdio: "ignore",
      servant: `${__dirname}/servant.js`,
    });
    bar.update(props.count);
    bar.stop();
    return DynamicBenchmarker.markdown(report);
  };
}
