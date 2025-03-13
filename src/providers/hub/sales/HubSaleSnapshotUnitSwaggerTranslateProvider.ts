import { Prisma } from "@prisma/client";
import { OpenApi } from "@samchon/openapi";
import fs from "fs";
import { Singleton } from "tstl";
import { v4 } from "uuid";

import { HubConfiguration } from "../../../HubConfiguration";
import { HubGlobal } from "../../../HubGlobal";
import { S3Util } from "../../../utils/S3Util";

export namespace HubSaleSnapshotUnitSwaggerTranslateProvider {
  export const collect = async (props: {
    lang_code: string | null;
    original: boolean;
    swagger: OpenApi.IDocument;
  }) =>
    ({
      id: v4(),
      original: props.original,
      url: await uploadSwagger(props.lang_code, props.swagger),
      lang_code: props.lang_code,
    }) satisfies Prisma.hub_sale_snapshot_unit_swagger_translatesCreateWithoutSwaggerInput;

  const uploadSwagger = async (
    lang_code: string | null,
    swagger: OpenApi.IDocument,
  ): Promise<string> => {
    if (HubGlobal.testing === true) {
      const id: string = v4();
      await fs.promises.writeFile(
        `${await prepareDirectory.get()}/${id}.json`,
        JSON.stringify(swagger),
        "utf8",
      );
      return `${HubConfiguration.API_HOST()}/public/swaggers/${id}`;
    }
    return await S3Util.putObject({
      path: `/hub/swaggers/${lang_code ?? "none"}/${v4()}`,
      type: "application/json",
      body: JSON.stringify(swagger),
    });
  };
}
const prepareDirectory = new Singleton(async () => {
  await fs.promises.mkdir(`${HubConfiguration.ROOT}/packages/swaggers`, {
    recursive: true,
  });
  return `${HubConfiguration.ROOT}/packages/swaggers`;
});
