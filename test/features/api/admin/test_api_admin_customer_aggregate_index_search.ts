import { ArrayUtil, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IAdminCustomerAggregate } from "@wrtnlabs/os-api/lib/structures/admin/IAdminCustomerAggregate";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";

import { ConnectionPool } from "../../../ConnectionPool";
import { test_api_hub_admin_login } from "../hub/actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../hub/actors/test_api_hub_customer_create";
import { test_api_admin_customer_access_elite_store } from "./test_api_admin_customer_access_elite_store";
import { test_api_admin_customer_access_villain_store } from "./test_api_admin_customer_access_villain_store";

export const test_api_admin_customer_aggregate_index_search = async (
  pool: ConnectionPool,
) => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_create(pool);

  // MEMBER CREATE
  await ArrayUtil.asyncRepeat(25)(async () => {
    await test_api_hub_customer_create(pool);
    if (Math.random() > 0.5) {
      await test_api_admin_customer_access_elite_store(pool);
    } else {
      await test_api_admin_customer_access_villain_store(pool);
    }
  });

  const total: IPage<IAdminCustomerAggregate.ISummary> =
    await HubApi.functional.admin.aggregate.index(pool.admin, {
      limit: 10,
      sort: ["-member.created_at"],
    });

  const search = TestValidator.search("member.index")(
    async (input: IAdminCustomerAggregate.IRequest.ISearch) => {
      const page: IPage<IAdminCustomerAggregate.ISummary> =
        await HubApi.functional.admin.aggregate.index(pool.admin, {
          limit: total.data.length,
          search: input,
          sort: ["-member.created_at"],
        });
      return page.data;
    },
  )(total.data, 4);

  await search({
    fields: ["id"],
    values: (member) => [member.id],
    request: ([id]) => ({ id }),
    filter: (member, [id]) => member.id === id,
  });

  await search({
    fields: ["ids"],
    values: (member) => [member.id],
    request: ([id]) => ({ ids: [id] }),
    filter: (member, [id]) => member.id === id,
  });

  await search({
    fields: ["member.type = members"],
    values: (member) => [member.member.seller],
    request: () => ({ member: { type: "members" } }),
    filter: (member) => member.member.seller === null,
  });

  await search({
    fields: ["member.type = sellers"],
    values: (member) => [member.member.seller],
    request: () => ({ member: { type: "sellers" } }),
    filter: (member) => member.member.seller !== null,
  });

  await search({
    fields: ["member"],
    values: (member) => [member.member.created_at],
    request: () => ({
      member: {
        from: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000)
          .toISOString()
          .substring(0, 10),
        to: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000)
          .toISOString()
          .substring(0, 10),
      },
    }),
    filter: (member, [created_at]) => member.member.created_at >= created_at,
  });

  await search({
    fields: ["member.emails.some.value"],
    values: (member) => [member.member.emails],
    request: ([email]) => ({ email: email[0].value }),
    filter: (member, [email]) =>
      member.member.emails[0].value === email[0].value,
  });

  await search({
    fields: ["member.nickname"],
    values: (member) => [member.member.nickname],
    request: ([nickname]) => ({ nickname }),
    filter: (member, [nickname]) => member.member.nickname === nickname,
  });
};
