import { TypedBody, TypedParam, TypedRoute } from "@nestia/core";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSaleContent } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleContent";

import { HubSaleSnapshotContentProvider } from "../../../../providers/hub/sales/HubSaleSnapshotContentProvider";

import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubSaleContentController } from "../../base/sales/HubSaleContentController";

export class HubSellerSaleContentController extends HubSaleContentController({
  path: "sellers",
  AuthGuard: HubSellerAuth,
}) {
  /**
   * Translate to another language.
   *
   * @param langCode Target language code
   * @param input Input data of the sale content
   * @returns Translated sale content
   * @tag Sale
   * @author Samchon
   */
  @TypedRoute.Post("contents/:langCode/translate")
  public translate(
    @TypedParam("langCode") langCode: string & IHubCustomer.LanguageType,
    @TypedBody() input: IHubSaleContent.ICreate,
  ): Promise<IHubSaleContent.ICreate> {
    return HubSaleSnapshotContentProvider.translate({
      langCode,
      input,
    });
  }
}
