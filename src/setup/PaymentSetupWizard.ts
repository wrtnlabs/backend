import cp from "child_process";
import dotenv from "dotenv";
import fs from "fs";
import { Singleton, sleep_for } from "tstl";

import { HubConfiguration } from "../HubConfiguration";
import { HubGlobal } from "../HubGlobal";

export namespace PaymentSetupWizard {
  export const prepared = (): boolean => {
    if (fs.existsSync(SERVER) === false) return false;
    try {
      execute("git pull");
      return true;
    } catch {
      fs.rmdirSync(REPOSITORY, { recursive: true });
      return false;
    }
  };

  export const setup = async (): Promise<void> => {
    if (fs.existsSync(REPOSITORY) === false) {
      try {
        await fs.promises.mkdir(HubConfiguration.ROOT + "/packages");
      } catch {}
      execute("git clone https://github.com/samchon/payments", {
        cwd: HubConfiguration.ROOT + "/packages",
      });
    }
    execute("git pull");
    execute("npm install");
    execute("npm run build:main");
    await schema();
  };

  export const start = async (): Promise<cp.ChildProcess> => {
    if (!prepared()) await setup();
    const child: cp.ChildProcess = cp.fork(SERVER, ["testing"], {
      stdio: "ignore",
      cwd: PAYMENT_ROOT,
      env: env.get(),
    });
    await sleep_for(1_000);
    return child;
  };

  export const webpack = async (): Promise<cp.ChildProcess> => {
    execute("npm run webpack");
    return cp.fork("server.js", ["testing"], {
      stdio: "ignore",
      cwd: `${PAYMENT_ROOT}/dist`,
      env: env.get(),
    });
  };

  const schema = (): Promise<void> =>
    new Promise((resolve, reject) => {
      execute("npm run build:prisma", {
        env: env.get(),
      });
      const p = cp.fork(SCHEMA, [], {
        stdio: "ignore",
        cwd: PAYMENT_ROOT,
        env: env.get(),
      });
      p.on("close", resolve);
      p.on("error", reject);
    });

  const execute = (
    command: string,
    props?: {
      cwd?: string;
      env?: NodeJS.ProcessEnv;
    },
  ): void => {
    cp.execSync(command, {
      stdio: "ignore",
      cwd: props?.cwd ?? PAYMENT_ROOT,
      ...(props?.env
        ? {
            env: props.env,
          }
        : {}),
    });
  };

  const env = new Singleton(() => ({
    ...dotenv.parse(fs.readFileSync(PAYMENT_ROOT + "/.env", "utf8")),
    ...HubGlobal.env,
  }));
}

const REPOSITORY = HubConfiguration.ROOT + "/packages/payments";
const PAYMENT_ROOT = REPOSITORY + "/packages/payment-backend";
const SERVER = PAYMENT_ROOT + "/lib/executable/server.js";
const SCHEMA = PAYMENT_ROOT + "/lib/executable/schema.js";
