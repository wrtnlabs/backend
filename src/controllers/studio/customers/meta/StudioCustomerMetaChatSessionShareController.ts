import core from "@nestia/core";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioMetaChatSessionShare } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionShare";

import { StudioMetaChatSessionShareProvider } from "../../../../providers/studio/meta/StudioMetaChatSessionShareProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { StudioMetaChatSessionShareController } from "../../base/meta/StudioMetaChatSessionShareController";

export class StudioCustomerMetaChatSessionShareController extends StudioMetaChatSessionShareController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {
  /**
   * Create a chat session share.
   *
   * Create a chat session share {@link IStudioMetaChatSessionShare}.
   *
   * The chat session share is a feature that allows you to share the chat session
   * with other users, and the other users can only read the chat session messages
   * without being able to send messages.
   *
   * If you specify a specific message ID in the chat session share, the other
   * user can only read the chat session messages to the specified message ID.
   * The next message will not be displayed.
   *
   * @param input Chat session share creation information
   * @returns Chat session share details
   * @author Samchon
   * @tag Meta
   */
  @core.TypedRoute.Post()
  public create(
    @HubCustomerAuth("member") customer: IHubCustomer,
    @core.TypedBody() input: IStudioMetaChatSessionShare.ICreate,
  ): Promise<IStudioMetaChatSessionShare> {
    return StudioMetaChatSessionShareProvider.create({
      customer,
      input,
    });
  }

  /**
   * Update a chat session share.
   *
   * Update a chat session share record; {@link IStudioMetaChatSessionShare}.
   *
   * You can change {@link IStudioMetaChatSessionShare.IUpdate.title title} or
   * {@link IStudioMetaChatSessionShare.IUpdate.message_id endpoint message}.
   *
   * @param id Target chat session share ID
   * @param input Chat session share update information
   * @author Samchon
   * @tag Meta
   */
  @core.TypedRoute.Put(":id")
  public update(
    @HubCustomerAuth("member") customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IStudioMetaChatSessionShare.IUpdate,
  ): Promise<void> {
    return StudioMetaChatSessionShareProvider.update({
      customer,
      id,
      input,
    });
  }

  /**
   * Erase a chat session share.
   *
   * Erase a chat session share record; {@link IStudioMetaChatSessionShare}.
   *
   * The chat session share will be deleted and the other user
   * will no longer be able to read the chat session messages.
   *
   * @param id Target chat session share ID
   * @author Samchon
   * @tag Meta
   */
  @core.TypedRoute.Delete(":id")
  public erase(
    @HubCustomerAuth("member") customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return StudioMetaChatSessionShareProvider.erase({
      customer,
      id,
    });
  }
}
