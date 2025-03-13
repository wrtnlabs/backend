import { TestValidator } from "@nestia/e2e";
import { OpenApi, OpenApiV3, OpenApiV3_1, SwaggerV2 } from "@samchon/openapi";
import fs from "fs";
import path from "path";
import typia from "typia";

import HubApi from "@wrtnlabs/os-api";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { HubConfiguration } from "../../../../../src/HubConfiguration";
import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../actors/test_api_hub_customer_create";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_sale } from "./internal/generate_random_sale";
import { prepare_random_sale_unit } from "./internal/prepare_random_sale_unit";

export const test_api_hub_sale_snapshot_unit_real_swagger_at = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_create(pool, undefined, undefined, "en");
  await test_api_hub_seller_join(pool);

  // 랜덤한 타 서비스 Swagger 파일을 가져옵니다.
  const asset = getRandomSwaggerFile(`${HubConfiguration.ROOT}/assets/swagger`);

  const sale: IHubSale = await generate_random_sale(pool, "approved", {
    units: [
      prepare_random_sale_unit({
        swagger: typia.assert<
          SwaggerV2.IDocument | OpenApiV3.IDocument | OpenApiV3_1.IDocument
        >(JSON.parse(asset!)),
      }),
    ],
  });

  const swagger: OpenApi.IDocument =
    await HubApi.functional.hub.customers.sales.swagger(
      pool.customer,
      sale.id,
      { unit_id: sale.units[0].id },
    );

  const swaggerWithDefaults = injectDefaults(
    JSON.parse(JSON.stringify(swagger)),
    sale,
  );

  TestValidator.equals("swagger")(swagger)(swaggerWithDefaults);
};

function injectDefaults(target: any, source: any) {
  if (typeof source !== "object" || source === null) {
    return target;
  }

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (typeof source[key] === "object" && source[key] !== null) {
        if (Array.isArray(source[key])) {
          target[key] = target[key] || [];
          source[key].forEach((item: any, index: number) => {
            target[key][index] = injectDefaults(target[key][index] || {}, item);
          });
        } else {
          target[key] = injectDefaults(target[key] || {}, source[key]);
        }
      } else if (key === "default" && !(key in target)) {
        target[key] = source[key];
      }
    }
  }

  return target;
}
const selectedFiles = new Set<string>();

const getRandomSwaggerFile = (swaggerPath: string): string | null => {
  // 1. Swagger 디렉토리 읽기
  const versions = fs
    .readdirSync(swaggerPath)
    .filter(
      (dir) =>
        dir.startsWith("v") &&
        fs.statSync(path.join(swaggerPath, dir)).isDirectory(),
    );

  if (versions.length === 0) {
    console.error("No version directories found");
    return null;
  }

  // 2. 모든 파일 목록 생성
  let allFiles: string[] = [];
  versions.forEach((version) => {
    const versionPath = path.join(swaggerPath, version);
    const files = fs
      .readdirSync(versionPath)
      .filter((file) => fs.statSync(path.join(versionPath, file)).isFile())
      .map((file) => path.join(version, file));
    allFiles = allFiles.concat(files);
  });

  // 3. 아직 선택되지 않은 파일들 필터링
  const availableFiles = allFiles.filter((file) => !selectedFiles.has(file));

  if (availableFiles.length === 0) {
    console.log("All files have been selected");
    selectedFiles.clear(); // 모든 파일이 선택되었다면 선택 기록을 초기화
    return null;
  }

  // 4. 랜덤 파일 선택
  const randomFile =
    availableFiles[Math.floor(Math.random() * availableFiles.length)];

  // 5. 선택된 파일 기록
  selectedFiles.add(randomFile);

  return fs.readFileSync(path.join(swaggerPath, randomFile), "utf-8");
};
