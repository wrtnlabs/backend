import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubBookmarkSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/bookmarks/IHubBookmarkSale";

import { HubBookmarkSaleProvider } from "../../../../../providers/hub/sales/bookmarks/HubBookmarkSaleProvider";

import { HubCustomerAuth } from "../../../../../decorators/HubCustomerAuth";

@Controller("hub/customers/sales/:saleId/bookmark")
export class HubCustomerBookmarkSaleController {
  /**
   * User adds a bookmark to a listing.
   *
   * @param saleId
   */
  @core.TypedRoute.Post()
  async create(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
  ): Promise<IHubBookmarkSale> {
    return HubBookmarkSaleProvider.create({
      customer,
      sale: { id: saleId },
    });
  }

  /**
   * User removes a property bookmark.
   *
   * @param saleId
   */
  @core.TypedRoute.Delete()
  async erase(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
  ): Promise<void> {
    return HubBookmarkSaleProvider.erase({
      customer,
      sale: { id: saleId },
    });
  }
}
