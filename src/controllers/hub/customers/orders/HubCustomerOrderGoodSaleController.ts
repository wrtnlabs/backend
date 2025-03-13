import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";

import { HubOrderGoodProvider } from "../../../../providers/hub/orders/HubOrderGoodProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";

@Controller("hub/customers/orders/goods/:saleId")
export class HubCustomerOrderGoodSaleController {
  /**
   * Get order good information by sale ID.
   *
   * Get the reverse reference information of the order good represented
   * by the {@link IHubOrderGood.IInvert} type through the belonging
   * {@link IHubSale.id}.
   *
   * If the customer has not purchased the target sale, or the order has
   * not been published, 404 error would be thrown. Even though the customer
   * has purchased the target sale, and the order has been published, but
   * the order good is not on a contract, 404 error would be thrown as well.
   *
   * For reference, the keyword "on a contract" means that the order good
   * contract has not been opened yet, or the order good contract has been
   * closed already.
   *
   * @param saleId Target sale's {@link IHubSale.id}
   * @returns Reverse reference information of the order good on a contract
   * @author Samchon
   * @tag Order
   */
  @core.TypedRoute.Get("getBySaleId")
  public getBySaleId(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
  ): Promise<IHubOrderGood.IInvert> {
    return HubOrderGoodProvider.getBySaleId({
      customer,
      sale: { id: saleId },
    });
  }

  /**
   * Test order good ownership by sale ID.
   *
   * Test whether the customer owns an order good on a contract by
   * its belonging sale ID.
   *
   * If the customer has not purchased the target sale, or the order has
   * not been published, `false` would be returned. Even though the customer
   * has purchased the target sale, and the order has been published, but
   * the order good is not on a contract, `false` would be returned as well.
   * Otherwise the customer has purchased the target sale, and the order has
   * been published, and the order good is on a contract, `true` returned.
   *
   * For reference, the keyword "on a contract" means that the order good
   * contract has not been opened yet, or the order good contract has been
   * closed already.
   *
   * @param saleId Target sale's {@link IHubSale.id}
   * @returns Whether purchased and on a contract or not
   * @author Samchon
   * @tag Order
   */
  @core.TypedRoute.Get("ownSale")
  public async ownSale(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
  ): Promise<boolean> {
    return HubOrderGoodProvider.ownSale({
      customer,
      sale: { id: saleId },
    });
  }
}
