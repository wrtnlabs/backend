import fs from "fs";
import path from "path";
import { VariadicSingleton } from "tstl";

import { HubConfiguration } from "../HubConfiguration";

export namespace LocalFileUploader {
  export const upload = async (props: {
    body: string;
    location: string;
  }): Promise<string> => {
    const location: string = path.resolve(`${PREFIX}/${props.location}`);
    await createDirectory.get(path.dirname(location));
    await fs.promises.writeFile(location, props.body, "utf8");
    return `${HubConfiguration.API_HOST()}/public/${props.location}`;
  };

  const createDirectory = new VariadicSingleton(async (str: string) => {
    if (fs.existsSync(str)) return;
    await fs.promises.mkdir(str, { recursive: true });
  });
}

const PREFIX = `${HubConfiguration.ROOT}/packages/public`;
