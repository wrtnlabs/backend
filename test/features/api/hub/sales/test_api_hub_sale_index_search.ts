import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { HubGlobal } from "../../../../../src/HubGlobal";
import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../actors/test_api_hub_customer_create";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_sale } from "./internal/generate_random_sale";

// @todo NOT AGGREGATE YET
export const test_api_hub_sale_index_search = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await test_api_hub_customer_create(pool);
  await test_api_hub_seller_join(pool, {
    email: HubGlobal.env.STORE_EMAIL,
    nickname: "studio.wrtn.io",
    password: "dkanrjsk",
  });
  await ArrayUtil.asyncRepeat(10)(async () => {
    await generate_random_sale(pool, "approved");
  });
  await ArrayUtil.asyncRepeat(25)(async () => {
    await test_api_hub_seller_join(pool);
    await generate_random_sale(pool, "approved");
  });

  await ArrayUtil.asyncRepeat(10)(async () => {
    await test_api_hub_seller_join(pool);
    await generate_random_sale(pool, null);
  });

  await test_api_hub_customer_join(pool);
  await test_api_hub_seller_join(pool, {
    email: HubGlobal.env.STORE_EMAIL,
    nickname: "store.wrtn.io",
    password: "dkanrjsk",
  });
  const total: IPage<IHubSale.ISummary> =
    await HubApi.functional.hub.customers.sales.index(pool.customer, {
      limit: REPEAT,
      sort: ["-sale.created_at"],
    });

  const search = TestValidator.search("sales.index")(
    async (input: IHubSale.IRequest.ISearch) => {
      const page: IPage<IHubSale.ISummary> =
        await HubApi.functional.hub.customers.sales.index(pool.customer, {
          limit: total.data.length,
          search: input,
          sort: ["-sale.created_at"],
        });
      return page.data;
    },
  )(total.data, 4);

  //----
  // IDENTIFIER
  //----
  await search({
    fields: ["sale.id"],
    values: (sale) => [sale.id],
    request: ([id]) => ({ id }),
    filter: (sale, [id]) => sale.id === id,
  });

  if (total.data.every((sale) => sale.categories.length > 0))
    await search({
      fields: ["channel_category_ids"],
      values: (sale) => [sale.categories.map((c) => c.id)],
      request: ([category_ids]) => ({ category_ids }),
      filter: (sale, [ids]) => sale.categories.some((c) => ids.includes(c.id)),
    });

  //----
  // CONTENT
  //----
  await search({
    fields: ["sale.content.title"],
    values: (sale) => [RandomGenerator.pick(sale.content.title.split(" "))],
    request: ([title]) => ({ title }),
    filter: (sale, [title]) => sale.content.title.includes(title),
  });

  await search({
    fields: ["tags"],
    values: (sale) => [sale.content.tags],
    request: ([tags]) => ({ tags }),
    filter: (sale, [tags]) => sale.content.tags.some((t) => tags.includes(t)),
  });

  //----
  // SELLER
  //----
  await search({
    fields: ["seller.id"],
    values: (sale) => [sale.seller.id],
    request: ([id]) => ({ seller: { id } }),
    filter: (sale, [id]) => sale.seller.id === id,
  });

  await search({
    fields: ["seller.name"],
    values: (sale) => [sale.seller.citizen!.name],
    request: ([name]) => ({ seller: { name } }),
    filter: (sale, [name]) => sale.seller.citizen!.name === name,
  });

  await search({
    fields: ["seller.mobile"],
    values: (sale) => [sale.seller.citizen!.mobile],
    request: ([mobile]) => ({ seller: { mobile } }),
    filter: (sale, [mobile]) => sale.seller.citizen!.mobile === mobile,
  });

  await search({
    fields: ["seller.nickname"],
    values: (sale) => [sale.seller.member.nickname],
    request: ([nickname]) => ({ seller: { nickname } }),
    filter: (sale, [nickname]) =>
      sale.seller.member.nickname.includes(nickname),
  });

  await search({
    fields: ["seller.show_wrtn = false"],
    values: (sale) => [sale.seller.member.emails[0].value],
    request: () => ({ seller: { show_wrtn: false } }),
    filter: (sale) =>
      !sale.seller.member.emails[0].value.includes(HubGlobal.env.STORE_EMAIL),
  });

  await search({
    fields: ["seller.show_wrtn = true"],
    values: (sale) => [sale.seller.member.emails[0].value],
    request: () => ({ seller: { show_wrtn: true } }),
    filter: (sale) =>
      sale.seller.member.emails[0].value.includes(HubGlobal.env.STORE_EMAIL),
  });

  //----
  // ADMIN
  //----
  await search({
    fields: ["sale.audit.approved_at"],
    values: (sale) => [sale.audit],
    request: ([]) => ({
      audit: {
        state: "approved",
      },
    }),
    filter: (sale) => sale.audit?.approved_at !== null,
  });

  await ArrayUtil.asyncRepeat(5)(async () => {
    await test_api_hub_seller_join(pool);
    const sale = await generate_random_sale(pool, "approved");

    if (Math.random() < 0.5) {
      await HubApi.functional.hub.sellers.sales.suspend(pool.seller, sale.id);
    } else {
      await HubApi.functional.hub.sellers.sales.pause(pool.seller, sale.id);
    }
  });

  await search({
    fields: ["sale.show_paused = only"],
    values: (sale) => [sale.paused_at],
    request: () => ({
      show_paused: "only",
    }),
    filter: (sale) => sale.paused_at !== null,
  });

  await search({
    fields: ["sale.show_paused"],
    values: (sale) => [sale.paused_at],
    request: () => ({
      show_paused: false,
    }),
    filter: (sale) => sale.paused_at === null,
  });

  await search({
    fields: ["sale.audit.rejected_at"],
    values: (sale) => [sale.audit],
    request: ([]) => ({
      audit: {
        state: "rejected",
      },
    }),
    filter: (sale) =>
      sale.audit?.rejected_at !== null && sale.audit?.approved_at === null,
  });

  await search({
    fields: ["sale.audit.approved_at & sale.audit.rejected_at"],
    values: (sale) => [sale.audit],
    request: ([]) => ({
      audit: {
        state: "agenda",
      },
    }),
    filter: (sale) =>
      sale.audit?.rejected_at === null && sale.audit?.approved_at === null,
  });

  await search({
    fields: ["sale.audit"],
    values: (sale) => [sale.audit],
    request: ([]) => ({
      audit: {
        state: "none",
      },
    }),
    filter: (sale) => sale.audit === null,
  });

  await search({
    fields: ["sale.show_bookmarked"],
    values: (sale) => [sale.bookmarked_at],
    request: ([]) => ({
      show_bookmarked: "only",
    }),
    filter: (sale) => sale.bookmarked_at !== null,
  });

  //----
  // AGGREGATES - @todo
  //----
  // await search({
  //   fields: ["sale.review.score"],
  //   values: (sale) => [
  //     (sale.aggregate.inquiry.review.statistics?.average ?? 0) * 0.8,
  //     (sale.aggregate.inquiry.review.statistics?.average ?? 0) * 1.2,
  //   ],
  //   request: ([minimum, maximum]) => ({
  //     review: { score: { minimum, maximum } },
  //   }),
  //   filter: (sale, [minimum, maximum]) =>
  //     minimum <= (sale.aggregate.inquiry.review.statistics?.average ?? 0) &&
  //     (sale.aggregate.inquiry.review.statistics?.average ?? 0) <= maximum,
  // });

  // await search({
  //   fields: ["sale.review.count"],
  //   values: (sale) => [
  //     Math.max(0, sale.aggregate.inquiry.review.count - 1),
  //     sale.aggregate.inquiry.review.count + 1,
  //   ],
  //   request: ([minimum, maximum]) => ({
  //     review: { score: { minimum, maximum } },
  //   }),
  //   filter: (sale, [minimum, maximum]) =>
  //     minimum <= sale.aggregate.inquiry.review.count &&
  //     sale.aggregate.inquiry.review.count <= maximum,
  // });
};

const REPEAT = 25;
