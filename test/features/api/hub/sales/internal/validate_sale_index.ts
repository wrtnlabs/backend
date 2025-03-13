import { TestValidator } from "@nestia/e2e";
import { HashMap, hash } from "tstl";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { ActorPath } from "@wrtnlabs/os-api/lib/typings/ActorPath";

import { ConnectionPool } from "../../../../../ConnectionPool";
import { TestGlobal } from "../../../../../TestGlobal";

export const validate_sale_index =
  (pool: ConnectionPool) =>
  (saleList: IHubSale[]) =>
  async (visibleInCustomer: boolean) => {
    const fetcher =
      (connection: HubApi.IConnection) =>
      (actor: ActorPath) =>
      (input: IPage.IRequest) =>
        HubApi.functional.hub[actor].sales.index(connection, input);
    await validate_in_viewer_level(fetcher(pool.admin))(saleList)("admins")(
      true,
    );
    await validate_in_viewer_level(fetcher(pool.customer))(saleList)(
      "customers",
    )(visibleInCustomer);
    await validate_in_seller_level(pool.seller)(fetcher(pool.seller))(saleList);
  };

type PageFetcher = (
  actor: ActorPath,
) => (input: IHubSale.IRequest) => Promise<IPage<IHubSale.ISummary>>;

const validate_in_viewer_level =
  (fetcher: PageFetcher) =>
  (saleList: IHubSale[]) =>
  (actor: ActorPath) =>
  async (visible: boolean) => {
    const page: IPage<IHubSale.ISummary> = await fetcher(actor)({
      limit: saleList.length,
      sort: ["-sale.created_at"],
    });
    const filtered: IHubSale.ISummary[] = page.data.filter(
      (summary) => saleList.find((s) => s.id === summary.id) !== undefined,
    );
    TestValidator.predicate(`page API of ${actor}`)(() =>
      visible === true ? !!filtered.length : !filtered.length,
    );
  };

const validate_in_seller_level =
  (connection: HubApi.IConnection) =>
  (fetcher: PageFetcher) =>
  async (saleList: IHubSale[]) => {
    const dict: HashMap<IHubSeller.IInvert, IHubSale[]> = create_entity_map();
    for (const sale of saleList) {
      const array: IHubSale[] = dict.take(sale.seller, () => []);
      array.push(sale);
    }

    for (const it of dict) {
      const seller: IHubSeller.IInvert = it.first;
      const mySales: IHubSale[] = it.second;

      await HubApi.functional.hub.customers.members.login(connection, {
        email: seller.member.emails[0].value,
        password: TestGlobal.PASSWORD,
      });

      const index: IPage<IHubSale.ISummary> = await fetcher("sellers")({
        limit: saleList.length,
      });
      TestValidator.index("seller ownership")(mySales)(index.data);
    }
  };

function create_entity_map<Key extends { id: string }, Value>(): HashMap<
  Key,
  Value
> {
  return new HashMap(
    (entity) => hash(entity.id),
    (x, y) => x.id === y.id,
  );
}
