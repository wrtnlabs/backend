import core from "@nestia/core";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioAccountSecret } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountSecret";

import { StudioAccountSecretProvider } from "../../../../providers/studio/accounts/StudioAccountSecretProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { StudioAccountSecretController } from "../../base/accounts/StudioAccountSecretController";

export class StudioCustomerAccountSecretController extends StudioAccountSecretController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {
  /**
   * Create a global variable.
   *
   * Create a new global variable
   * {@link IStudioAccountSecret} in {@link IStudioAccount studio account}. Note
   * that the variable value set in the global variable
   * {@link IStudioAccountSecret.value} is encrypted and stored in the DB.
   *
   * Note that the global variable set in the studio account can only be edited by
   * the owner of the account or an {@link IStudioEnterpriseEmployee employee}
   * who has a position higher than an administrator of the
   * {@link IStudioEnterprise company} that owns the account.
   *
   * @param accountCode {@link IStudioAccount.code} of the account
   * @param input Global variable information to be created
   * @returns Created global variable information
   * @author Samchon
   * @tag Account
   */
  @core.TypedRoute.Post()
  public create(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("accountCode") accountCode: string,
    @core.TypedBody() input: IStudioAccountSecret.ICreate,
  ): Promise<IStudioAccountSecret> {
    return StudioAccountSecretProvider.create({
      customer,
      account: { code: accountCode },
      input,
    });
  }

  /**
   * Variable Create or edit a variable.
   *
   * Create a new global variable {@link IStudioAccountSecret} in
   * {@link IStudioAccount studio account}. If there is a record with the same
   * {@link IStudioAccountSecret.key} value, edit that record. Then, repeat the
   * same process for {@link IStudioAccountSecret.values} to create or edit
   * variable values.
   *
   * Note that global variables set in a studio account can only be edited by
   * the owner of the account or {@link IStudioEnterpriseEmployee employees}
   * who have a manager or higher position in the {@link IStudioEnterprise company}
   * that owns the account.
   *
   * @param accountCode {@link IStudioAccount.code} of the account
   * @param input Information about the global variable to be created or edited
   * @returns Information about the global variable created or edited
   * @author Samchon
   * @tag Account
   */
  @core.TypedRoute.Post("emplace")
  public emplace(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("accountCode") accountCode: string,
    @core.TypedBody() input: IStudioAccountSecret.ICreate,
  ): Promise<IStudioAccountSecret> {
    return StudioAccountSecretProvider.emplace({
      customer,
      account: { code: accountCode },
      input,
    });
  }

  /**
   * Modify global variables.
   *
   * Modify the {@link IStudioAccountSecret global variable} set in the
   * {@link IStudioAccount studio account}.
   *
   * Note that global variables set in a studio account can only be edited by
   * the owner of the account or an {@link IStudioEnterpriseEmployee employee}
   * with a position higher than an administrator of the
   * {@link IStudioEnterprise company} that owns the account.
   *
   * @param accountCode {@link IStudioAccount.code} of the account
   * @param id {@link IStudioAccount.id} of the target global variable
   * @param input Information on the global variable to be modified
   * @author Samchon
   * @tag Account
   */
  @core.TypedRoute.Put(":id")
  public update(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("accountCode") accountCode: string,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IStudioAccountSecret.IUpdate,
  ): Promise<void> {
    return StudioAccountSecretProvider.update({
      customer,
      account: { code: accountCode },
      id,
      input,
    });
  }

  /**
   * Delete global variables.
   *
   * Delete the {@link IStudioAccountSecret global variable} set in
   * {@link IStudioAccount studio account}.
   *
   * Note that global variables set in a studio account can only be edited by
   * the owner of the account or an {@link IStudioEnterpriseEmployee employee}
   * with a manager or higher position in the {@link IStudioEnterprise company}
   * that owns the account.
   *
   * @param accountCode {@link IStudioAccount.code} of the account
   * @param id {@link IStudioAccount.id} of the target global variable
   * @author Samchon
   * @tag Account
   */
  @core.TypedRoute.Delete(":id")
  public erase(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("accountCode") accountCode: string,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return StudioAccountSecretProvider.erase({
      customer,
      account: { code: accountCode },
      id,
    });
  }
}
