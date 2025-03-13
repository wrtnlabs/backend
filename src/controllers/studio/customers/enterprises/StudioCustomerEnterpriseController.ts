import core from "@nestia/core";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";

import { StudioEnterpriseProvider } from "../../../../providers/studio/enterprise/StudioEnterpriseProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { StudioEnterpriseController } from "../../base/enterprises/StudioEnterpriseController";

export class StudioCustomerEnterpriseController extends StudioEnterpriseController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {
  /**
   * Create a company.
   *
   * Create a new {@link IStudioEnterprise company}.
   *
   * {@link IHubCustomer Customer} can create a new company and issue a new account
   * to the company, or transfer their {@link IStudioAccount account} to the new
   * company and issue another new account for themselves.
   *
   * @param input Company creation information
   * @returns Details of the created company
   * @author Asher
   * @tag Enterprise
   */
  @core.TypedRoute.Post()
  public async create(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IStudioEnterprise.ICreate,
  ): Promise<IStudioEnterprise> {
    return StudioEnterpriseProvider.create({
      customer,
      input,
    });
  }

  /**
   * Change company information.
   *
   * Change the basic information of {@link IStudioEnterprise company}.
   *
   * However, to do this, the current {@link IHubCustomer customer} must be a
   * {@link IStudioEnterpriseEmployee employee} with the owner title of the company.
   *
   * @param accountCode {@link IStudioEnterprise.id} of the storage of the origin
   * @param input Company change information
   *
   * @author Asher
   * @tag Enterprise
   */
  @core.TypedRoute.Put(":id")
  public async update(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IStudioEnterprise.IUpdate,
  ): Promise<void> {
    return StudioEnterpriseProvider.update({
      customer,
      id,
      input,
    });
  }

  /**
   * Delete a company.
   *
   * Deletes a {@link IStudioEnterprise company}, and also removes the
   * {@link IStudioAccount account} of which it is a part.
   *
   * However, the current {@link IHubCustomer customer} must be a
   * {@link IStudioEnterpriseEmployee employee} with the owner title of the
   * company.
   *
   * @param accountCode
   * @author Asher
   * @tag Enterprise
   */
  @core.TypedRoute.Delete(":id")
  public async erase(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return StudioEnterpriseProvider.erase({
      customer,
      id,
    });
  }
}
