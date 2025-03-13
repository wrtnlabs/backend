import core from "@nestia/core";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

import { StudioMetaChatSessionConnectionProvider } from "../../../../providers/studio/meta/StudioMetaChatSessionConnectionProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { StudioMetaChatSessionConnectionController } from "../../base/meta/StudioMetaChatSessionConnectionController";

export class StudioCustomerMetaChatSessionConnectionController extends StudioMetaChatSessionConnectionController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {
  /**
   * Meta LLM Chat Session Connection Disconnection Processing.
   *
   * An API that processes Meta LLM Chat Session Connections as if they were
   * closed, even if they were not actually closed.
   *
   * This API is provided temporarily because the front-end is currently unable
   * to properly disconnect WebSockets, so this API will be deprecated soon.
   *
   * @param sessionId {@link IStudioMetaChatSession.id} of the chat session to which it belongs
   * @param id {@link IStudioMetaChatSessionConnection.id} of the target chat session connection
   * @author Samchon
   * @tag Meta
   * @deprecated
   */
  @core.TypedRoute.Delete(":id/disconnect")
  public disconnect(
    @HubCustomerAuth("member") customer: IHubCustomer,
    @core.TypedParam("sessionId") sessionId: string & tags.Format<"uuid">,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return StudioMetaChatSessionConnectionProvider.fakeDisconnect({
      customer,
      session: { id: sessionId },
      id,
    });
  }
}
