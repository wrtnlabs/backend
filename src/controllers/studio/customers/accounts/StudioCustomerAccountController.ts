import core from "@nestia/core";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";

import { StudioAccountProvider } from "../../../../providers/studio/accounts/StudioAccountProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { StudioAccountController } from "../../base/accounts/StudioAccountController";

export class StudioCustomerAccountController extends StudioAccountController({
  path: "customers",
  AuthGuard: HubCustomerAuth,
}) {
  /**
   * Create an account.
   *
   * {@link IHubCustomer customer} creates a {@link IStudioAccount account}.
   *
   * Even if the customer's purpose is to establish a
   * {@link IStudioEnterprise company} and assign the account to it, the customer
   * must first create his or her own account, then establish the company,
   * and then transfer ownership of the account.
   *
   * @param input Account creation information
   * @returns Details of the created account
   * @author Samchon
   * @tag Account
   */
  @core.TypedRoute.Post()
  public async create(
    @HubCustomerAuth("member") customer: IHubCustomer,
    @core.TypedBody() input: IStudioAccount.ICreate,
  ): Promise<IStudioAccount> {
    return StudioAccountProvider.create({
      customer,
      input,
    });
  }

  /**
   * Edit Account.
   *
   * {@link IHubCustomer Customer} modifies the identifier code of the
   * {@link IStudioAccount account} that he/she created in the past.
   *
   * @param id {@link IStudioAccount.id} of the target account
   * @param input Modify account code information
   * @author Samchon
   * @tag Account
   */
  @core.TypedRoute.Put(":id")
  public async update(
    @HubCustomerAuth("member") customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IStudioAccount.IUpdate,
  ): Promise<void> {
    await StudioAccountProvider.update({
      customer,
      id,
      input,
    });
  }

  /**
   * Delete account.
   *
   * {@link IHubCustomer customer} deletes the {@link IStudioAccount account}
   * that he/she previously created.
   *
   * If the target account belongs to a {@link IStudioEnterprise company}, not a
   * {@link IHubMember member}, the current customer must be a
   * {@link IStudioEnterpriseEmployee employee} with top-level administrator
   * rights in the company. The company will be deleted along with the account.
   *
   * @param id {@link IStudioAccount.id} of the target account
   * @author Samchon
   * @tag Account
   */
  @core.TypedRoute.Delete(":id")
  public async erase(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    await StudioAccountProvider.erase({
      customer,
      id,
    });
  }
}
