import { TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleAudit } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAudit";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../../actors/test_api_hub_customer_create";
import { test_api_hub_seller_join } from "../../actors/test_api_hub_seller_join";
import { generate_random_sale } from "../internal/generate_random_sale";
import { validate_sale_index } from "../internal/validate_sale_index";

export const test_api_hub_sale_audit_reject_and_approve = async (
  pool: ConnectionPool,
): Promise<void> => {
  // 관리자, 고객 및 판매자 모두 준비
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_create(pool);
  await test_api_hub_seller_join(pool);

  // 판매자의 매물 생성 (심사 거절 상태)
  const sale: IHubSale = await generate_random_sale(pool, "rejected");

  TestValidator.equals("audit")(!!sale.audit)(true);
  TestValidator.equals("rejections")(!!sale.audit?.rejected_at)(true);
  TestValidator.equals("approval")(!!sale.audit?.approved_at)(false);

  // 고객은 승인되지 않은 위 매물을 볼 수 없다.
  await validate_sale_index(pool)([sale])(false);

  // 관리자가 결정을 번복, 해당 매물을 승인함
  await HubApi.functional.hub.admins.sales.audits.approve(
    pool.admin,
    sale.id,
    sale.audit!.id,
    {
      snapshot_id: null,
      fee_ratio: 0.015,
    },
  );

  // 심사 정보만 별도 조회
  const reloaded: IHubSaleAudit =
    await HubApi.functional.hub.sellers.sales.audits.at(
      pool.seller,
      sale.id,
      sale.audit!.id,
    );
  TestValidator.equals("rejections")(reloaded.rejections.length)(1);
  TestValidator.equals("approval")(!!reloaded.approval)(true);
};
