import core from "@nestia/core";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubOrderGoodIssue } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssue";

import { HubOrderGoodIssueProvider } from "../../../../providers/hub/orders/issues/HubOrderGoodIssueProvider";

import { IHubControllerProps } from "../IHubControllerProps";
import { HubOrderGoodIssueReadableController } from "./HubOrderGoodIssueReadableController";

export function HubOrderGoodIssueWritableController<
  Actor extends IHubCustomer | IHubSeller.IInvert,
>(props: IHubControllerProps<"customers" | "sellers">) {
  class HubOrderGoodIssueWritableController extends HubOrderGoodIssueReadableController<Actor>(
    props,
  ) {
    /**
     * Create an Issue.
     *
     * Create an issue for a purchased product.
     *
     * @param orderId {@link IHubOrder.id} of the order to which it belongs
     * @param goodId {@link IHubOrderGood.id} of the product to which it belongs
     * @param input Issue input information
     * @returns Issue information written
     *
     * @author Samchon
     * @tag Issue
     */
    @core.TypedRoute.Post()
    public create(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
      @core.TypedParam("goodId") goodId: string & tags.Format<"uuid">,
      @core.TypedBody() input: IHubOrderGoodIssue.ICreate,
    ): Promise<IHubOrderGoodIssue> {
      return HubOrderGoodIssueProvider.create({
        actor,
        order: { id: orderId },
        good: { id: goodId },
        input,
      });
    }

    /**
     * Modify Issue.
     *
     * Modify the information of an issue.
     *
     * @param orderId {@link IHubOrder.id} of the target order
     * @param goodId {@link IHubOrderGood.id} of the target product
     * @param id {@link IHubOrderGoodIssue.id} of the target issue
     * @param input Information of the issue to be modified {@link IHubOrderGoodIssue.IUpdate}
     * @return Information of the modified issue {@link IHubOrderGoodIssue.ISnapshot}
     * @author Asher
     * @tag Issue
     */
    @core.TypedRoute.Put(":id")
    public update(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
      @core.TypedParam("goodId") goodId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
      @core.TypedBody() input: IHubOrderGoodIssue.IUpdate,
    ): Promise<IHubOrderGoodIssue.ISnapshot> {
      return HubOrderGoodIssueProvider.update({
        actor,
        order: { id: orderId },
        good: { id: goodId },
        id,
        input,
      });
    }

    /**
     * Delete Issue.
     *
     * Deletes the created issue.
     *
     * @param orderId {@link IHubOrder.id} of the target order
     * @param goodId {@link IHubOrderGood.id} of the target product
     * @param id {@link IHubOrderGoodIssue.id} of the target issue
     * @return void
     * @author Asher
     * @tag Issue
     */
    @core.TypedRoute.Delete("/:id")
    public erase(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
      @core.TypedParam("goodId") goodId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<void> {
      return HubOrderGoodIssueProvider.erase({
        actor,
        order: { id: orderId },
        good: { id: goodId },
        id,
      });
    }
  }
  return HubOrderGoodIssueWritableController;
}
