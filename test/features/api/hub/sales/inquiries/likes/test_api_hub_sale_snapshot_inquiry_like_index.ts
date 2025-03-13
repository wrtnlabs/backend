//import HubApi from "@wrtnlabs/os-api/lib/index";
//import { IHubSaleQuestion } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleQuestion";
//
//import { ConnectionPool } from "../../../../../../ConnectionPool";
//import { test_api_hub_admin_login } from "../../../actors/test_api_hub_admin_login";
//import { test_api_hub_customer_join } from "../../../actors/test_api_hub_customer_join";
//import { generate_random_sale } from "../../internal/generate_random_sale";
//import { generate_random_sale_question } from "../../internal/generate_random_sale_question";
//import {test_api_hub_seller_join} from "../../../actors/test_api_hub_seller_join";
//
//export const test_api_hub_sale_snapshot_inquiry_like_index = async (
//  pool: ConnectionPool,
//): Promise<void> => {
//  await test_api_hub_admin_login(pool);
//  await test_api_hub_customer_join(pool);
//  await test_api_hub_seller_join(pool);
//
//  const sale = await generate_random_sale(pool, "approved");
//  const question: IHubSaleQuestion = await generate_random_sale_question(
//    pool,
//    sale,
//  );
//
//  await HubApi.functional.hub.customers.sales.questions.likes.create(
//    pool.customer,
//    sale.id,
//    question.id,
//  );
//};
