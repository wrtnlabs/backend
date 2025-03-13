import core from "@nestia/core";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioEnterpriseEmployee } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseEmployee";

import { StudioEnterpriseEmployeeProvider } from "../../../../providers/studio/enterprise/StudioEnterpriseEmployeeProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { StudioEnterpriseEmployeeController } from "../../base/enterprises/StudioEnterpriseEmployeeController";

export class StudioCustomerEnterpriseEmployeeController extends StudioEnterpriseEmployeeController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {
  /**
   * Appoint an employee.
   *
   * {@link IHubCustomer Customer}, who is an employee of {@link IStudioEnterprise}
   * at least an administrator level, appoints a specific {@link IHubMember member}
   * as an employee of {@link IStudioEnterpriseEmployee}.
   *
   * However, the person who can appoint an employee must be an owner or an
   * administrator of the company. In the case of an administrator, he can only
   * appoint employees of a lower rank than himself, and only the owner can appoint
   * employees with the owner or administrator level.
   *
   * @param accountCode {@link IStudioAccount.code} of the company account
   * @param input Employee appointment information
   * @returns Details of the appointed employee
   * @author Asher
   * @tag Enterprise
   */
  @core.TypedRoute.Post()
  public async create(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("accountCode") accountCode: string,
    @core.TypedBody() input: IStudioEnterpriseEmployee.ICreate,
  ): Promise<IStudioEnterpriseEmployee> {
    return StudioEnterpriseEmployeeProvider.create({
      customer,
      account: { code: accountCode },
      input,
    });
  }

  /**
   * Change Employee Position.
   *
   * {@link IHubCustomer Customer}, who is an employee of
   * {@link IStudioEnterprise Enterprise} at the manager level or higher, changes
   * the position of a specific {@link IStudioEnterpriseEmployee Employee}.
   *
   * However, only the owner or manager of the company can change the employee's
   * position.
   *
   * In the case of managers, only positions of lower ranks can be changed, and only
   * the owner can change employees with the owner or manager position.
   *
   * @param accountCode {@link IStudioAccount.code} of the company account
   * @param id {@link IStudioEnterpriseEmployee.id} of the target employee
   * @param input Employee position change information
   * @author Asher
   * @tag Enterprise
   */
  @core.TypedRoute.Put(":id")
  public async update(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("accountCode") accountCode: string,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IStudioEnterpriseEmployee.IUpdate,
  ): Promise<void> {
    return StudioEnterpriseEmployeeProvider.update({
      customer,
      account: { code: accountCode },
      id,
      input,
    });
  }

  /**
   * Fire an employee.
   *
   * An {@link IHubCustomer customer} who is an employee of
   * {@link IStudioEnterprise company} at least an administrator level fires
   * a specific {@link IStudioEnterpriseEmployee employee}.
   *
   * However, the only person who can fire an employee is the owner or
   * an administrator of the company.
   *
   * An administrator can only fire employees of a lower rank than themselves,
   * and only the owner can fire employees who are either owners or administrators.
   *
   * @param accountCode {@link IStudioAccount.code} of the company account
   * @param id {@link IStudioEnterpriseEmployee.id} of the target employee
   * @author Asher
   * @tag Enterprise
   */
  @core.TypedRoute.Delete(":id")
  public async erase(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("accountCode") accountCode: string,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    await StudioEnterpriseEmployeeProvider.erase({
      customer,
      account: { code: accountCode },
      id,
    });
  }

  /**
   * Accepting an employee invitation.
   *
   * {@link IHubCustomer Customer} accepts the invitation sent to him/her,
   * thereby becoming an {@link IStudioEnterpriseEmployee Employee} of the actual
   * {@link IStudioEnterprise Company}.
   *
   * @param accountCode {@link IStudioAccount.code} of the target company account
   * @author Asher
   * @tag Enterprise
   */
  @core.TypedRoute.Put("approve")
  public async approve(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("accountCode") accountCode: string,
  ): Promise<IStudioEnterpriseEmployee> {
    return StudioEnterpriseEmployeeProvider.approve({
      customer,
      account: { code: accountCode },
    });
  }
}
