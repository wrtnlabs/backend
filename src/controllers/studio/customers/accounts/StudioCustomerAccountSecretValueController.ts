import core from "@nestia/core";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioAccountSecretValue } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountSecretValue";

import { StudioAccountSecretValueProvider } from "../../../../providers/studio/accounts/StudioAccountSecretValueProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { StudioAccountSecretValueController } from "../../base/accounts/StudioAccountSecretValueController";

export class StudioCustomerAccountSecretValueController extends StudioAccountSecretValueController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {
  /**
   * Generate individual variable values.
   *
   * @param accountCode {@link IStudioAccount.code} of the attributed account
   * @param secretId {@link IStudioAccountSecret.id} of the attributed variable value set
   * @param input Variable value creation information
   * @returns Generated variable values
   *
   * @author Samchon
   * @tag Account
   */
  @core.TypedRoute.Post(":secretId/values")
  public create(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("accountCode") accountCode: string,
    @core.TypedParam("secretId") secretId: string & tags.Format<"uuid">,
    @core.TypedBody() input: IStudioAccountSecretValue.ICreate,
  ): Promise<IStudioAccountSecretValue> {
    return StudioAccountSecretValueProvider.create({
      customer,
      account: { code: accountCode },
      secret: { id: secretId },
      input,
    });
  }

  /**
   * Modify individual variable values.
   *
   * @param accountCode {@link IStudioAccount.code} of the attributed account
   * @param secretId {@link IStudioAccountSecret.id} of the attributed variable value set
   * @param id {@link IStudioAccountSecretValue.id} of the variable value
   * @param input Modification information
   *
   * @author Samchon
   * @tag Account
   */
  @core.TypedRoute.Put(":secretId/values/:id")
  public update(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("accountCode") accountCode: string,
    @core.TypedParam("secretId") secretId: string & tags.Format<"uuid">,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IStudioAccountSecretValue.IUpdate,
  ): Promise<void> {
    return StudioAccountSecretValueProvider.update({
      customer,
      account: { code: accountCode },
      secret: { id: secretId },
      id,
      input,
    });
  }

  /**
   * Delete individual variable values.
   *
   * @param accountCode {@link IStudioAccount.code} of the account to which it belongs
   * @param secretId {@link IStudioAccountSecret.id} of the set of variable values to which it belongs
   * @param id {@link IStudioAccountSecretValue.id} of the variable value
   *
   * @author Samchon
   * @tag Account
   */
  @core.TypedRoute.Delete(":secretId/values/:id")
  public erase(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("accountCode") accountCode: string,
    @core.TypedParam("secretId") secretId: string & tags.Format<"uuid">,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return StudioAccountSecretValueProvider.erase({
      customer,
      account: { code: accountCode },
      secret: { id: secretId },
      id,
    });
  }
}
