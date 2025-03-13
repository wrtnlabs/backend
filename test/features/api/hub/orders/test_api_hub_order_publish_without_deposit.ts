// import { RandomGenerator, TestValidator } from "@nestia/e2e";
// import typia from "typia";

// import HubApi from "@wrtnlabs/os-api/lib/index";
// import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
// import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
// import { IHubDepositDonation } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDepositDonation";
// import { IHubDepositHistory } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDepositHistory";
// import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
// import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
// import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
// import { IHubSaleUnitStockPrice } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitStockPrice";

// import { ConnectionPool } from "../../../../ConnectionPool";
// import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
// import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
// import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
// import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
// import { generate_random_sale } from "../sales/internal/generate_random_sale";

// export const test_api_hub_order_publish_without_deposit = async (
//     pool: ConnectionPool,
// ): Promise<void> => {
//     // 액터 준비
//     await test_api_hub_admin_login(pool);
//     await test_api_hub_seller_join(pool);
//     const customer: IHubCustomer = await test_api_hub_customer_join(pool);

//     // 매물에서 주문까지 일괄 생성
//     const sale: IHubSale = await generate_random_sale(pool, "approved");
//     const commodity: IHubCartCommodity = await generate_random_cart_commodity(
//         pool,
//         sale,
//     );
//     const order: IHubOrder = await HubApi.functional.hub.customers.orders.create(
//         pool.customer,
//         {
//             goods: [
//                 {
//                     commodity_id: commodity.id,
//                 },
//             ],
//             published_at: null,
//             expired_at: null,
//         },
//     );
//     typia.assertEquals(order);

//     // 출판 시도시 돈이 없어 불가
//     await TestValidator.httpError("publish without deposit")(422)(() =>
//         HubApi.functional.hub.customers.orders.update(pool.customer, order.id, {
//             published_at: new Date().toISOString(),
//             expired_at: null,
//         }),
//     );

//     // 관리자가 예치금 공여
//     const donation: IHubDepositDonation =
//         await HubApi.functional.hub.admins.deposits.donations.create(
//             pool.admin,
//             {
//                 citizen_id: customer.citizen!.id,
//                 value: 10_000_000,
//                 reason: RandomGenerator.content()()(),
//             },
//         );
//     typia.assertEquals(donation);

//     // 출판 재시도
//     await HubApi.functional.hub.customers.orders.update(
//         pool.customer,
//         order.id,
//         {
//             published_at: new Date().toISOString(),
//             expired_at: null,
//         },
//     );

//     // 예치금 인출 확인
//     const prices: IHubSaleUnitStockPrice[] = order.goods
//         .map((g) =>
//             g.commodity.sale.units.map((u) => u.stocks.map((s) => s.price)),
//         )
//         .flat()
//         .flat();
//     const histories: IPage<IHubDepositHistory> =
//         await HubApi.functional.hub.customers.deposits.histories.index(
//             pool.customer,
//             {
//                 limit: 0,
//                 sort: ["-history.created_at"],
//             },
//         );
//     typia.assertEquals(histories);
//     TestValidator.equals("outcomes.length")(prices.length)(
//         histories.data.length - 1,
//     );
//     TestValidator.equals("amount")(
//         prices.map((p) => p.fixed).reduce((a, b) => a + b, 0),
//     )(
//         histories.data
//             .filter((h) => h.deposit.direction === -1)
//             .map((h) => h.value)
//             .reduce((a, b) => a + b, 0),
//     );
// };
