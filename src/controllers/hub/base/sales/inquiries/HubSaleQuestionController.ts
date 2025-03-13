import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubSaleQuestion } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleQuestion";

import { HubSaleQuestionProvider } from "../../../../../providers/hub/sales/inquiries/HubSaleQuestionProvider";

import { IHubControllerProps } from "../../IHubControllerProps";

export function HubSaleQuestionController<Actor extends IHubActorEntity>(
  props: IHubControllerProps,
) {
  @Controller(`hub/${props.path}/sales/:saleId/questions`)
  class HubSaleQuestionController {
    /**
     * Retrieve the list of question summary information for the listing snapshot.
     *
     * Retrieve the {@link IHubSaleQuestion} list.
     *
     * The returned {@link IHubSaleQuestion}s are {@link IPage paging} processed.
     * And depending on how the request information {@link IHubSaleQuestion.IRequest}
     * is set, you can {@link IHubSaleQuestion.IRequest.limit} limit the number of
     * records per page, {@link IHubSaleQuestion.IRequest.search} search for questions
     * for listing snapshots that meet a specific condition, or
     * {@link IHubSaleQuestion.IRequest.sort} specify the sort condition for questions
     * for listing snapshots.
     *
     * @param saleId {@link IHubSale.id} of the sale in question
     * @param input list request information {@link IHubSaleQuestion.IRequest}
     * @return list of paged {@link IHubSaleQuestion} summary information
     * @author Asher
     * @tag Inquiry
     */
    @core.TypedRoute.Patch()
    public index(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedBody() input: IHubSaleQuestion.IRequest,
    ): Promise<IPage<IHubSaleQuestion.ISummary>> {
      return HubSaleQuestionProvider.index({
        actor,
        sale: { id: saleId },
        input,
      });
    }

    /**
     * Retrieve question details for a listing snapshot.
     *
     * Retrieves a specific {@link IHubSaleQuestion}.
     *
     * @param saleId {@link IHubSale.id} of the sale in question
     * @param id {@link IHubSaleQuestion.id} to retrieve
     * @return Question details for the retrieved listing snapshot
     * @tag Inquiry
     */
    @core.TypedRoute.Get(":id")
    public at(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IHubSaleQuestion> {
      return HubSaleQuestionProvider.at({
        actor,
        sale: { id: saleId },
        id,
      });
    }

    /**
     * Delete a question about a listing snapshot.
     *
     * @param saleId {@link IHubSale.id} of the sale being deleted
     * @param id {@link IHubSaleQuestion.id} to delete
     * @return void
     * @author Asher
     * @tag Inquiry
     */
    @core.TypedRoute.Delete(":id")
    public erase(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<void> {
      return HubSaleQuestionProvider.erase({
        actor,
        sale: { id: saleId },
        id,
      });
    }
  }
  return HubSaleQuestionController;
}
