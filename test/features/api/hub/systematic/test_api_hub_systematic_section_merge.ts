import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSection } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubSection";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../actors/test_api_hub_customer_create";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../sales/internal/generate_random_sale";
import { generate_random_section } from "./internal/generate_random_section";

export const test_api_hub_systematic_section_merge = async (
  pool: ConnectionPool,
): Promise<void> => {
  // 유저 준비
  await test_api_hub_customer_create(pool);
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);

  // 각각 4 개의 섹션과 매물 생성
  const prefix: string = RandomGenerator.alphabets(8);
  const sectionList: IHubSection[] = await ArrayUtil.asyncRepeat(REPEAT)(() =>
    generate_random_section(pool, {
      code: `${prefix}_${RandomGenerator.alphabets(8)}`,
    }),
  );
  await ArrayUtil.asyncMap(sectionList)((section) =>
    generate_random_sale(pool, "approved", {
      section_code: section.code,
    }),
  );

  // 4 개의 섹션 모두 병합
  await HubApi.functional.hub.admins.systematic.sections.merge(pool.admin, {
    keep: sectionList[0].id,
    absorbed: sectionList.slice(1).map((s) => s.id),
  });

  // 병합된 섹션의 매물들을 조회, 모두 병합된 섹션의 매물이어야 함
  const salePage: IPage<IHubSale.ISummary> =
    await HubApi.functional.hub.sellers.sales.index(pool.seller, {
      limit: REPEAT,
      sort: ["-sale.created_at"],
    });
  salePage.data.forEach((sale) =>
    TestValidator.equals("merge")(sectionList[0])(sale.section),
  );

  // 전체 섹션 목록 조회, 3 개의 섹션이 사라졌어야 함
  const sectionPage: IPage<IHubSection> =
    await HubApi.functional.hub.admins.systematic.sections.index(pool.admin, {
      limit: REPEAT,
      search: {
        code: `${prefix}_`,
      },
    });
  TestValidator.equals("merge")([sectionList[0]])(sectionPage.data);
};
const REPEAT = 4;
