import core from "@nestia/core";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioEnterpriseTeam } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseTeam";

import { StudioEnterpriseTeamProvider } from "../../../../providers/studio/enterprise/StudioEnterpriseTeamProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { StudioEnterpriseTeamController } from "../../base/enterprises/StudioEnterpriseTeamController";

export class StudioCustomerEnterpriseTeamController extends StudioEnterpriseTeamController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {
  /**
   * Creates a new team in a company.
   *
   * A {@link IHubCustomer customer} who is an
   * {@link IStudioEnterpriseEmployee employee} of a {@link IStudioEnterprise company}
   * and above, creates a new {@link IStudioEnterpriseTeam team}.
   *
   * Also, the customer who created the team, himself, becomes the "head"
   * {@link IStudioEnterpriseTeamCompanion member} of the team.
   *
   * @param accountCode The {@link IStudioAccount.code} of the company account to which the team belongs
   * @param input Team creation information
   * @returns Details of the created team
   * @author Asher
   * @tag Enterprise
   */
  @core.TypedRoute.Post()
  public async create(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("accountCode") accountCode: string,
    @core.TypedBody() input: IStudioEnterpriseTeam.ICreate,
  ): Promise<IStudioEnterpriseTeam> {
    return StudioEnterpriseTeamProvider.create({
      customer,
      account: { code: accountCode },
      input,
    });
  }

  /**
   * Change team information.
   *
   * {@link IStudioEnterpriseTeam Enterprise Team} manager or higher level
   * {@link IStudioEnterpriseTeamCompanion member} {@link IHubCustomer customer},
   *
   * Changes the team information.
   *
   * If the information to be changed is related to a member, not a team,
   * you must use a different API.
   *
   * @param accountCode {@link IStudioAccount.code} of the corporate account
   * @param id {@link IStudioEnterpriseTeam.id} of the target team
   * @param input Team change information
   * @author Asher
   * @tag Enterprise
   */
  @core.TypedRoute.Put(":id")
  public async update(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("accountCode") accountCode: string,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IStudioEnterpriseTeam.IUpdate,
  ): Promise<void> {
    await StudioEnterpriseTeamProvider.update({
      customer,
      account: { code: accountCode },
      id,
      input,
    });
  }

  /**
   * Disbands a team.
   *
   * A {@link IStudioEnterpriseTeamCompanion member} {@link IHubCustomer customer}
   * who is a "leader" of a {@link IStudioEnterpriseTeam enterprise team}, disbands
   * his or her own team.
   *
   * @param accountCode {@link IStudioAccount.code} of the enterprise account to which it belongs
   * @param id {@link IStudioEnterpriseTeam.id} of the target team
   * @author Asher
   * @tag Enterprise
   */
  @core.TypedRoute.Delete(":id")
  public async erase(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("accountCode") accountCode: string,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    await StudioEnterpriseTeamProvider.erase({
      customer,
      account: { code: accountCode },
      id,
    });
  }

  /**
   * Merge teams.
   *
   * A {@link IStudioEnterpriseTeamCompanion member}
   * {@link IStudioEnterpriseTeam customer} who is a "leader" of multiple
   * {@link IStudioEnterpriseTeam teams} within a {@link IStudioEnterprise company}
   * merges multiple teams into one.
   *
   * If there are {@link IStudioEnterpriseEmployee employees} who are
   * simultaneously on multiple teams to be merged, they will be assigned the
   * {@link IStudioEnterpriseTeamCompanion.role role} of the remaining team.
   *
   * @param accountCode The {@link IStudioAccount.code} of the company account
   * @param input Team merge information
   * @author Asher
   * @tag Enterprise
   */
  @core.TypedRoute.Delete("merge")
  public async merge(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("accountCode") accountCode: string,
    @core.TypedBody() input: IStudioEnterpriseTeam.IMerge,
  ): Promise<void> {
    await StudioEnterpriseTeamProvider.merge({
      customer,
      account: { code: accountCode },
      input,
    });
  }
}
