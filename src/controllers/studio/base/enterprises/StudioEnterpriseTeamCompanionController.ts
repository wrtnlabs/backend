import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IStudioEnterpriseTeamCompanion } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseTeamCompanion";

import { StudioEnterpriseTeamCompanionProvider } from "../../../../providers/studio/enterprise/StudioEnterpriseTeamCompanionProvider";

import { IHubControllerProps } from "../../../hub/base/IHubControllerProps";

export function StudioEnterpriseTeamCompanionController<
  Actor extends IHubActorEntity,
>(props: IHubControllerProps) {
  @Controller(
    `studio/${props.path}/enterprises/:accountCode/teams/:teamCode/companions`,
  )
  class StudioEnterpriseTeamCompanionController {
    /**
     * Retrieve the summary information list of corporate team members.
     *
     * Retrieves {@link IPage paging} the
     * {@link IStudioEnterpriseTeamCompanion.ISummary members' summary information}
     * belonging to {@link IStudioEnterpriseTeam team} of a specific
     * {@link IStudioEnterprise company}.
     *
     * @param accountCode {@link IStudioAccount.code} of the corporate account
     * @param teamCode {@link IStudioEnterpriseTeam.code} of the team
     * @param input Page and search request information
     * @returns List of paging summary information of members
     * @author Asher
     * @tag Enterprise
     */
    @core.TypedRoute.Patch()
    public async index(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("accountCode") accountCode: string,
      @core.TypedParam("teamCode") teamCode: string,
      @core.TypedBody() input: IStudioEnterpriseTeamCompanion.IRequest,
    ): Promise<IPage<IStudioEnterpriseTeamCompanion.ISummary>> {
      return StudioEnterpriseTeamCompanionProvider.index({
        actor,
        account: { code: accountCode },
        team: { code: teamCode },
        input,
      });
    }

    /**
     * Retrieve member details.
     *
     * Retrieve details of a specific {@link IStudioEnterpriseTeamCompanion member}
     * belonging to a {@link IStudioEnterpriseTeam team}.
     *
     * @param accountCode {@link IStudioAccount.code} of the affiliated company account
     * @param teamCode {@link IStudioEnterpriseTeam.code} of the affiliated team
     * @param id {@link IStudioEnterpriseTeamCompanion.id} of the target member
     * @returns member details
     * @author Asher
     * @tag Enterprise
     */
    @core.TypedRoute.Get(":id")
    public async at(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("accountCode") accountCode: string,
      @core.TypedParam("teamCode") teamCode: string,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IStudioEnterpriseTeamCompanion> {
      return StudioEnterpriseTeamCompanionProvider.at({
        actor,
        account: { code: accountCode },
        team: { code: teamCode },
        id,
      });
    }
  }

  return StudioEnterpriseTeamCompanionController;
}
