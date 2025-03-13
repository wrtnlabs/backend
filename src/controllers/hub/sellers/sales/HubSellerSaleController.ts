import core from "@nestia/core";
import { tags } from "typia";

import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { HubSaleProvider } from "../../../../providers/hub/sales/HubSaleProvider";

import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubSaleController } from "../../base/sales/HubSaleController";

export class HubSellerSaleController extends HubSaleController({
  path: "sellers",
  AuthGuard: HubSellerAuth,
}) {
  /**
   * Registering a listing.
   *
   * {@link IHubSeller seller} registers a new {@link IHubSale listing}.
   *
   * However, even if a seller registers a listing through this API, the sale does
   * not start immediately. The manager must {@link IHubSaleAudit review} and
   * {@link IHubSaleAuditApproval approve} the listing, and even then, the
   * {@link IHubSale.opened_at sales start date} set by the seller when registering
   * the listing arrives, and only then does the actual sale begin.
   *
   * Please note that the listing has a rather complex structure, and its
   * {@link IHubSale.ICreate input information} is also the same. Therefore,
   * please read the explanations in the related DTO and ERD commentary carefully
   * and fully understand the related structure before developing the client.
   *
   * @param input listing input information
   * @returns generated listing information
   * @author Samchon
   * @tag Sale
   */
  @core.TypedRoute.Post()
  public create(
    @HubSellerAuth() seller: IHubSeller.IInvert,
    @core.TypedBody() input: IHubSale.ICreate,
  ): Promise<IHubSale> {
    return HubSaleProvider.create({
      seller,
      input,
    });
  }

  /**
   * Edit listing.
   *
   * Modify an existing {@link IHubSale listing} registered by
   * {@link IHubSeller seller}. However, the modification is done by accumulating
   * and issuing new {@link IHubSaleSnapshot snapshot} records, not by modifying
   * an existing record.
   *
   * And if the listing has already been {@link IHubSaleAudit reviewed} and
   * {@link IHubSaleAuditApproval approved}, this means that the listing must be
   * reviewed again by the {@link IHubAdministrator administrator} when modifying it.
   *
   * On the other hand, if the current listing is under review, this API cannot be
   * used. Instead, use the {@link osApi.functional.hub.sellers.sales.audits.emend}
   * function corresponding to the edit API. For reference, listings that have been
   * {@link IHubSaleAuditRejection rejected} whether additional revisions are possible
   * or not depends on {@link IHubSaleAuditRejection.reversible}, which indicates
   * whether the review is possible.
   *
   * @param id {@link IHubSale.id} of the target listing
   * @param input listing edit information
   * @returns modified listing information
   * @author Samchon
   * @tag Sale
   */
  @core.TypedRoute.Put(":id")
  public update(
    @HubSellerAuth() seller: IHubSeller.IInvert,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubSale.IUpdate,
  ): Promise<IHubSale> {
    return HubSaleProvider.update({
      seller,
      id,
      input,
    });
  }

  /**
   * Duplicate listing input values.
   *
   * This API is a kind of utility function that reconstructs
   * {@link IHubSale.ICreate input information} from the {@link IHubSale listing}
   * registered by {@link IHubSeller seller}. This will be useful when a seller needs
   * to {@link create duplicate} an existing listing, or {@link update edit} an
   * existing listing.
   *
   * @param id {@link IHubSale.id} of the target listing
   * @returns duplicated listing input information
   * @author Samchon
   * @tag Sale
   */
  @core.TypedRoute.Get(":id/replica")
  public replica(
    @HubSellerAuth() seller: IHubSeller.IInvert,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<IHubSale.ICreate> {
    return HubSaleProvider.replica({
      seller,
      id,
    });
  }

  /**
   * Pause.
   *
   * Temporarily pauses the sale of {@link IHubSale listing}.
   * The current time is recorded in {@link IHubSale.paused_at}. In this case,
   * {@link IHubCustomer customer} can still view the listing on the list and
   * detail pages, but the listing will be labeled "This item is paused for sale."
   *
   * In addition, customers will not be able to add it to their
   * {@link IHubCartItem cart} until the {@link IHubSeller seller} calls the
   * {@link restore} function to remove the "paused" status of the listing.
   *
   * @param id {@link IHubSale.id} of the target listing
   * @author Samchon
   * @tag Sale
   */
  @core.TypedRoute.Delete(":id/pause")
  public pause(
    @HubSellerAuth() seller: IHubSeller.IInvert,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return HubSaleProvider.pause({
      seller,
      id,
    });
  }

  /**
   * Suspend sale of the listing.
   *
   * {@link IHubSeller seller} suspends the sale of the {@link IHubSale listing}
   * that he/she registered himself/herself for some reason. The current time is
   * recorded in {@link IHubSale.suspended_at}, and customers cannot view the listing
   * at all on the list or details page.
   *
   * However, {@link IHubSeller seller} and {@link IHubAdministrator administrator}
   * can still view it, so it is a SOFT DELETION only for customers. Of course,
   * until {@link IHubSeller seller} calls the {@link restore} function to remove
   * the "suspended sale" status of the listing, the customer cannot add it to the
   * {@link IHubCartItem shopping cart}.
   *
   * @param id {@link IHubSale.id} of the target listing
   * @author Samchon
   * @tag Sale
   */
  @core.TypedRoute.Delete(":id/suspend")
  public suspend(
    @HubSellerAuth() seller: IHubSeller.IInvert,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return HubSaleProvider.suspend({
      seller,
      id,
    });
  }

  /**
   * Resume sale.
   *
   * When the target {@link IHubSale listing} is in
   * {@link IHubSale.paused_at sale paused} or {@link IHubSale.suspended_at suspended}
   * state, it will be cleared and the sale will resume.
   *
   * @param id of the target listing {@link IHubSale.id}
   * @author Samchon
   * @tag Sale
   */
  @core.TypedRoute.Put(":id/restore")
  public restore(
    @HubSellerAuth() seller: IHubSeller.IInvert,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return HubSaleProvider.restore({
      seller,
      id,
    });
  }
}
