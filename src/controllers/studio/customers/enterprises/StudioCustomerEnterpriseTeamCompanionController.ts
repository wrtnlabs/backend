import core from "@nestia/core";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioEnterpriseTeamCompanion } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseTeamCompanion";

import { StudioEnterpriseTeamCompanionProvider } from "../../../../providers/studio/enterprise/StudioEnterpriseTeamCompanionProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { StudioEnterpriseTeamCompanionController } from "../../base/enterprises/StudioEnterpriseTeamCompanionController";

export class StudioCustomerEnterpriseTeamCompanionController extends StudioEnterpriseTeamCompanionController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {
  /**
   * Assign team members.
   *
   * A {@link IHubCustomer customer} who is a {@link IStudioEnterpriseTeam team}
   * manager or higher level {@link IStudioEnterpriseTeamCompanion member}
   * within the {@link IStudioEnterprise company} appoints a specific
   * {@link IStudioEnterpriseEmployee employee} within the company to his team.
   *
   * However, only the manager or "head" of the team can appoint members. In the
   * case of managers, only members of a lower level than their own role can be
   * appointed, and only the "head" of the team can appoint members of the "head"
   * and "manager" level.
   *
   * @param accountCode {@link IStudioAccount.code} of the repository to which the member belongs
   * @param teamCode {@link IStudioEnterpriseTeam.code} of the team to which the member belongs
   * @param input Member appointment information
   * @returns Details of the created member
   * @author Asher
   * @tag Enterprise
   */
  @core.TypedRoute.Post()
  public async create(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("accountCode") accountCode: string,
    @core.TypedParam("teamCode") teamCode: string,
    @core.TypedBody() input: IStudioEnterpriseTeamCompanion.ICreate,
  ): Promise<IStudioEnterpriseTeamCompanion> {
    return StudioEnterpriseTeamCompanionProvider.create({
      customer,
      account: { code: accountCode },
      team: { code: teamCode },
      input,
    });
  }

  /**
   * Change a member's role.
   *
   * A {@link IHubCustomer customer} who is a
   * {@link IStudioEnterpriseTeamCompanion member} of an
   * {@link IStudioEnterpriseTeam team} within {@link IStudioEnterprise company},
   * changes another member's {@link IStudioEnterpriseTeamCompanion.role role}.
   *
   * However, only the manager or "head" of the team can change the member's role.
   * In the case of an manager, only members with a lower level than their own
   * role can be changed, and only the "head" of the team can change members with
   * a "head" or "manager" level.
   *
   * @param accountCode {@link IStudioAccount.code} of the repository to which it belongs
   * @param teamCode {@link IStudioEnterpriseTeam.code} of the team to which it belongs
   * @param id {@link IStudioEnterpriseTeamCompanion.id} of the target member
   * @param input Information about changing the member's role
   * @author Asher
   * @tag Enterprise
   */
  @core.TypedRoute.Put(":id")
  public async update(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("accountCode") accountCode: string,
    @core.TypedParam("teamCode") teamCode: string,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IStudioEnterpriseTeamCompanion.IUpdate,
  ): Promise<void> {
    return StudioEnterpriseTeamCompanionProvider.update({
      customer,
      account: { code: accountCode },
      team: { code: teamCode },
      id,
      input,
    });
  }

  /**
   * Remove a member.
   *
   * A {@link IHubCustomer customer} who is a {@link IStudioEnterpriseTeam team}
   * of an {@link IStudioEnterpriseTeam team} of an {@link IStudioEnterprise Team}
   * of an administrator level or higher removes another member from the team.
   *
   * However, only the administrator or "head" of the team can remove a member.
   *
   * In the case of an administrator, only members of a lower level can be removed,
   * and only the "head" of the team can remove members of the "head" and "manager"
   * level.
   *
   * @param accountCode {@link IStudioAccount.code} of the repository to which it belongs
   * @param teamCode {@link IStudioEnterpriseTeam.code} of the team to which it belongs
   * @param id {@link IStudioEnterpriseTeamCompanion.id} of the target member
   * @author Asher
   * @tag Enterprise
   */
  @core.TypedRoute.Delete(":id")
  public async erase(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("accountCode") accountCode: string,
    @core.TypedParam("teamCode") teamCode: string,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return StudioEnterpriseTeamCompanionProvider.erase({
      customer,
      account: { code: accountCode },
      team: { code: teamCode },
      id,
    });
  }
}
