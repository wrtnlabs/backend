import core from "@nestia/core";
import { WebSocketAcceptor } from "tgrid";
import { tags } from "typia";

import { IAuthorization } from "@wrtnlabs/os-api/lib/structures/common/IAuthorization";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioMetaChatListener } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatListener";
import { IStudioMetaChatService } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatService";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";

import { StudioMetaChatSessionProvider } from "../../../../providers/studio/meta/StudioMetaChatSessionProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { StudioMetaChatSessionController } from "../../base/meta/StudioMetaChatSessionController";

export class StudioCustomerMetaChatSessionController extends StudioMetaChatSessionController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {
  /**
   * Open only Meta LLM chat sessions.
   *
   * Open Meta LLM chat sessions, but do not connect to them and start chatting.
   *
   * A feature specifically created for Frontend requests.
   *
   * @author Samchon
   * @tag Meta
   */
  @core.TypedRoute.Post()
  public create(
    @HubCustomerAuth("member") customer: IHubCustomer,
    @core.TypedBody() input: IStudioMetaChatSession.ICreate,
  ): Promise<IStudioMetaChatSession> {
    return StudioMetaChatSessionProvider.create({
      customer,
      input,
      connect: false,
    });
  }

  /**
   * Start Meta LLM chat.
   *
   * The client connects to the Meta LLM chat server using the WebSocket protocol
   * and starts a chat session.
   *
   * The client can receive events from the Meta LLM chat server by providing
   * an object that implements the {@link IStudioMetaChatListener} interface to
   * the WebSocket server.
   *
   * And by calling the functions of {@link IStudioMetaChatService} to
   * {@link WebSocketAcceptor.getDriver}, the client can use the functions
   * provided by the WebSocket server.
   *
   * Note that after successfully connecting to the WebSocket server, the client
   * must immediately call the {@link IStudioMetaChatService.initialize} function.
   * This function initializes the chat session and returns the
   * {@link IStudioMetaChatSession} object with the corresponding information
   * to the client.
   *
   * @param query Query parameter, {@link IStudioMetaChatSession.id} of the
   *              new chat session can be directly specified and the mockup setting
   *              of the chat session can be
   * @author Samchon
   * @tag Meta
   */
  @core.WebSocketRoute()
  public start(
    @core.WebSocketRoute.Acceptor()
    acceptor: WebSocketAcceptor<
      IAuthorization,
      IStudioMetaChatService,
      IStudioMetaChatListener
    >,
    @core.WebSocketRoute.Query()
    query: IStudioMetaChatService.IStartQuery,
  ): Promise<void> {
    return StudioMetaChatSessionProvider.start({
      query: query ?? {},
      acceptor,
    });
  }

  /**
   * Return to the past Meta LLM chat session and restart.
   *
   * The client connects to the Meta LLM chat server via the WebSocket protocol
   * and continues the chat session {@link IStudioMetaChatSession} that was
   * previously in progress. In other words, this is an API function that
   * reconnects to the chat session that was previously executed with the
   * {@link start} function and restores/proceeds its state.
   *
   * And this `restart()` function has the same usage as the previous {@link start},
   * so the client can receive events from the Meta LLM chat server by providing
   * an object that implements the {@link IStudioMetaChatListener} interface to the
   * WebSocket server. And by calling the functions of {@link IStudioMetaChatService}
   * to {@link WebSocketAcceptor.getDriver}, the client can use the functions provided
   * by the WebSocket server.
   *
   * Of course, after successfully connecting to the WebSocket server, the client
   * must immediately call the {@link IStudioMetaChatService.initialize} function.
   * This function restores the target chat session and returns the
   * {@link IStudioMetaChatSession} object to the client.
   *
   * @param id {@link IStudioMetaChatSession.id} of the chat session to restart
   * @param query Mockup setting for the chat session
   * @author Samchon
   * @tag Meta
   */
  @core.WebSocketRoute(":id")
  public restart(
    @core.WebSocketRoute.Param("id") id: string & tags.Format<"uuid">,
    @core.WebSocketRoute.Query()
    query: IStudioMetaChatService.IQuery,
    @core.WebSocketRoute.Acceptor()
    acceptor: WebSocketAcceptor<
      IAuthorization,
      IStudioMetaChatService,
      IStudioMetaChatListener
    >,
  ): Promise<void> {
    return StudioMetaChatSessionProvider.restart({
      id,
      query: query ?? {},
      acceptor,
    });
  }

  /**
   * Modify Meta LLM chat session information.
   *
   * Modify the information of the previously created
   * {@link IStudioMetaChatSession Meta LLM chat session}.
   *
   * Currently, the only information that can be modified is
   * {@link IStudioMetaChatSession.title}.
   *
   * @param id {@link IStudioMetaChatSession.id} of the target chat session
   * @param input Modify information for the session
   * @author Samchon
   * @tag Meta
   */
  @core.TypedRoute.Put(":id")
  public update(
    @HubCustomerAuth("member") customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IStudioMetaChatSession.IUpdate,
  ): Promise<void> {
    return StudioMetaChatSessionProvider.update({
      customer,
      id,
      input,
    });
  }

  /**
   * Meta LLM Pins a chat session.
   *
   * A pinned chat session is displayed pinned to the top, separate from other
   * chat sessions.
   *
   * @param id {@link IStudioMetaChatSession.id} of the target chat session
   * @author Samchon
   * @tag Meta
   */
  @core.TypedRoute.Put(":id/pin")
  public pin(
    @HubCustomerAuth("member") customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return StudioMetaChatSessionProvider.pin({
      customer,
      id,
    });
  }

  /**
   * Unpin a Meta LLM chat session.
   *
   * A pinned chat session is displayed pinned to the top, separate from
   * other chat sessions.
   *
   * This function unpins such a chat session, returning it to a normal chat session.
   *
   * @param id {@link IStudioMetaChatSession.id} of the target chat session
   * @author Samchon
   * @tag Meta
   */
  @core.TypedRoute.Put(":id/unpin")
  public unpin(
    @HubCustomerAuth("member") customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return StudioMetaChatSessionProvider.unpin({
      customer,
      id,
    });
  }

  /**
   * Delete Meta LLM chat session.
   *
   * Deletes the previously created {@link IStudioMetaChatSession Meta LLM chat session}.
   *
   * The session can no longer be retrieved with {@link index} and {@link at},
   * and cannot be restarted with {@link restart}.
   *
   * @param id {@link IStudioMetaChatSession.id} of the target chat session
   * @author Samchon
   * @tag Meta
   */
  @core.TypedRoute.Delete(":id")
  public erase(
    @HubCustomerAuth("member") customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return StudioMetaChatSessionProvider.erase({
      customer,
      id,
    });
  }

  /**
   * Bulk delete Meta LLM chat sessions.
   *
   * All {@link IStudioMetaChatSession Meta LLM chat sessions} created by
   * the customer will be deleted in bulk.
   *
   * The customer will no longer be able to view existing sessions, and
   * {@link restart restart} is also not possible.
   *
   * @author Samchon
   * @tag Meta
   */
  @core.TypedRoute.Delete("eraseAll")
  public eraseAll(
    @HubCustomerAuth("member") customer: IHubCustomer,
  ): Promise<void> {
    return StudioMetaChatSessionProvider.eraseAll(customer);
  }

  /**
   * Disconnection handling for all connections in Meta LLM chat session.
   *
   * An API that handles Meta LLM chat session connections as if they were closed,
   * even if they were not actually closed.
   *
   * This is a temporary API provided because the front-end is currently unable
   * to properly disconnect websocket connections, so this API will be deprecated
   * soon.
   *
   * @param id {@link IStudioMetaChatSession.id} of the chat session to which it belongs
   * @author Samchon
   * @tag Meta
   * @deprecated
   */
  @core.TypedRoute.Delete(":id/disconnect")
  public disconnect(
    @HubCustomerAuth("member") customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return StudioMetaChatSessionProvider.fakeDisconnect({
      customer,
      id,
    });
  }
}
