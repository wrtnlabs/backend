import { v4 } from "uuid";

import { IHubSaleUnitStockPrice } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitStockPrice";

export namespace HubSaleUnitStockPriceDiagnoser {
  export const preview = (
    input: IHubSaleUnitStockPrice.ICreate,
  ): IHubSaleUnitStockPrice => ({
    id: v4(),
    threshold: input.threshold,
    fixed: input.fixed,
    variable: input.variable,
  });

  export const replica = (
    input: IHubSaleUnitStockPrice,
  ): IHubSaleUnitStockPrice.ICreate => ({
    threshold: input.threshold,
    fixed: input.fixed,
    variable: input.variable,
  });
}
