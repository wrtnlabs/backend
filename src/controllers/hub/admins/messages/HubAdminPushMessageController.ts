import { TypedBody, TypedFormData, TypedParam, TypedRoute } from "@nestia/core";
import FastifyMulter from "fastify-multer";
import { tags } from "typia";

import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubPushMessage } from "@wrtnlabs/os-api/lib/structures/hub/messages/IHubPushMessage";
import { IHubPushMessageContent } from "@wrtnlabs/os-api/lib/structures/hub/messages/IHubPushMessageContent";

import { HubPushMessageProvider } from "../../../../providers/hub/messages/HubPushMessageProvider";

import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubPushMessageController } from "../../base/messages/HubPushMessageController";

export class HubAdminPushMessageController extends HubPushMessageController({
  path: "admins",
  AuthGuard: HubAdminAuth,
}) {
  /**
   * Bulk creation/update of metadata via CSV file.
   *
   * Bulk create or update metadata records of push messages via CSV file with
   * the columns below. If the column composition of the input CSV file is different
   * from the following, a 400 Bad Request error occurs.
   *
   * Also, for each record in CSV, if there is a code of an existing push message,
   * the corresponding push message metadata record is updated, otherwise a new
   * record is created.
   *
   * @param upload CSV file, etc.
   * @author Samchon
   * @tag PushMessage
   */
  @TypedRoute.Post("csv")
  public csv(
    @HubAdminAuth() admin: IHubAdministrator,
    @TypedFormData.Body(() => FastifyMulter())
    upload: IHubPushMessage.ICsvUpload,
  ): Promise<void> {
    return HubPushMessageProvider.csv({
      admin,
      file: upload.file,
    });
  }

  /**
   * Create push message metadata.
   *
   * @param input Push message input information
   * @returns Push message information
   * @author Samchon
   * @tag PushMessage
   */
  @TypedRoute.Post()
  public create(
    @HubAdminAuth() admin: IHubAdministrator,
    @TypedBody() input: IHubPushMessage.ICreate,
  ): Promise<IHubPushMessage> {
    return HubPushMessageProvider.create({
      admin,
      input,
    });
  }

  /**
   * Modify push message content.
   *
   * @param id {@link IHubPushMessage.id} of the target push message
   * @param input content input information
   * @returns modified content information
   * @author Samchon
   * @tag PushMessage
   */
  @TypedRoute.Put(":id")
  public update(
    @HubAdminAuth() admin: IHubAdministrator,
    @TypedParam("id") id: string & tags.Format<"uuid">,
    @TypedBody() input: IHubPushMessageContent.ICreate,
  ): Promise<IHubPushMessageContent> {
    return HubPushMessageProvider.update({
      admin,
      id,
      input,
    });
  }

  /**
   * Delete a push message.
   *
   * This is not an actual deletion, but a soft deletion.
   *
   * @param id {@link IHubPushMessage.id} of the target push message
   * @author Samchon
   * @tag PushMessage
   */
  @TypedRoute.Delete(":id")
  public erase(
    @HubAdminAuth() admin: IHubAdministrator,
    @TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return HubPushMessageProvider.erase({
      admin,
      id,
    });
  }
}
