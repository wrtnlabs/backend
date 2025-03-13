import { RandomGenerator, TestValidator } from "@nestia/e2e";
import { OpenApi } from "@samchon/openapi";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";
import { IHubSaleSnapshot } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshot";
import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";
import { IHubSaleQuestion } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleQuestion";

import { ConnectionPool } from "../../../../ConnectionPool";
import { TestGlobal } from "../../../../TestGlobal";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { test_api_hub_customer_create } from "../actors/test_api_hub_customer_create";
import { test_api_hub_customer_join } from "../actors/test_api_hub_customer_join";
import { test_api_hub_seller_join } from "../actors/test_api_hub_seller_join";
import { generate_random_cart_commodity } from "../carts/internal/generate_random_cart_commodity";
import { generate_random_sale_of_hub_system } from "../sales/internal/generate_random_sale_of_hub_system";
import { generate_random_order } from "./internal/generate_random_order";
import { generate_random_order_publish } from "./internal/generate_random_order_publish";

export const test_api_hub_order_good_api_call_of_hub_system = async (
  pool: ConnectionPool,
): Promise<[OpenApi.IDocument, string]> => {
  //----
  // 중개 상품 구매하기
  //----
  // 액터 준비
  await test_api_hub_admin_login(pool);
  await test_api_hub_seller_join(pool);
  const customer: IHubCustomer.IAuthorized =
    await test_api_hub_customer_join(pool);

  // 매물에서 주문까지 일괄 생성
  const commodity: IHubCartCommodity = await generate_random_cart_commodity(
    pool,
    await generate_random_sale_of_hub_system(pool, "approved", customer),
  );
  const order: IHubOrder = await generate_random_order(pool, [commodity]);
  ``;
  order.publish = await generate_random_order_publish(pool, order);

  // 스웨거 정보 열람하기
  const good: IHubOrderGood = order.goods[0];
  const sale: IHubSaleSnapshot.IInvert = good.commodity.sale;
  const unit: IHubSaleUnit.IInvert = sale.units[0];
  const swagger: OpenApi.IDocument =
    await HubApi.functional.hub.customers.orders.goods.snapshots.swagger(
      pool.customer,
      order.id,
      good.id,
      sale.snapshot_id,
      {
        unit_id: unit.id,
      },
    );

  //----
  // 허브 시스템 API 를 중개 상품을 통하여 호출
  //
  // 본 시스템의 API 를 재귀적으로 호출함으로써, proxy의 안정성을 심층 검증한다.
  //----
  // 새 고객 레코드를 발행, 다른 토큰을 사용해본다
  const again: IHubCustomer.IAuthorized = await (async () => {
    const again: IHubCustomer.IAuthorized =
      await test_api_hub_customer_create(pool);
    const signed: IHubCustomer =
      await HubApi.functional.hub.customers.members.login(pool.customer, {
        email: customer.member!.emails[0].value,
        password: TestGlobal.PASSWORD,
      });
    return {
      ...signed,
      setHeaders: again.setHeaders,
      token: again.token,
    };
  })();

  // 구매한 상품 API 호출에는 새 토큰을
  const connection: HubApi.IConnection = {
    host: swagger.servers![1].url,
    headers: {
      Authorization: again.setHeaders.Authorization,
    },
  };

  // 하지만 중개 서버는 구 토큰을 사용
  await test_sale_question_store(connection, again, sale);

  // FOR THE NEXT STEP
  return [swagger, connection.headers!.Authorization as string];
};

const test_sale_question_store = async (
  connection: HubApi.IConnection,
  customer: IHubCustomer,
  sale: IEntity,
): Promise<void> => {
  // 질문글 등록
  const question: IHubSaleQuestion =
    await HubApi.functional.hub.customers.sales.questions.create(
      connection,
      sale.id,
      {
        title: RandomGenerator.paragraph()(),
        body: RandomGenerator.content()()(),
        format: "txt",
        files: [],
        secret: false,
      },
    );

  // 질문글 열람
  const read: IHubSaleQuestion =
    await HubApi.functional.hub.customers.sales.questions.at(
      connection,
      sale.id,
      question.id,
    );
  TestValidator.equals("create")(question)(read);

  // 고객 레코드는 다르되, 같은 회원임
  TestValidator.predicate("customer")(
    () =>
      customer.id !== read.customer.id &&
      customer.member !== null &&
      customer.member.id === read.customer.member?.id,
  );
};
