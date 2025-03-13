import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IStudioEnterpriseTeam } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseTeam";

import { StudioEnterpriseTeamProvider } from "../../../../providers/studio/enterprise/StudioEnterpriseTeamProvider";

import { IHubControllerProps } from "../../../hub/base/IHubControllerProps";

export function StudioEnterpriseTeamController<Actor extends IHubActorEntity>(
  props: IHubControllerProps,
) {
  @Controller(`studio/${props.path}/enterprises/:accountCode/teams`)
  class StudioEnterpriseTeamController {
    /**
     * Retrieve the summary information list of corporate teams.
     *
     * Retrieves all {@link IStudioEnterpriseTeam.ISummary team summary information}s
     * of a specific {@link IStudioEnterprise company}.
     *
     * {@link IPage paging}.
     *
     * @param accountCode {@link IStudioAccount.code} of the corporate account
     * @param input Page and search request information
     * @returns List of paging team summary information
     * @author Asher
     * @tag Enterprise
     */
    @core.TypedRoute.Patch()
    public async index(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("accountCode") accountCode: string,
      @core.TypedBody() input: IStudioEnterpriseTeam.IRequest,
    ): Promise<IPage<IStudioEnterpriseTeam.ISummary>> {
      return StudioEnterpriseTeamProvider.index({
        actor,
        account: { code: accountCode },
        input,
      });
    }

    /**
     * View team details.
     *
     * View details of a specific {@link IStudioEnterpriseTeam team} organized by
     * {@link IStudioEnterprise}.
     *
     * @param accountCode {@link IStudioAccount.code} of the affiliated company account
     * @param id {@link IStudioEnterpriseTeam.id} of the target team
     * @returns team details
     * @author Asher
     * @tag Enterprise
     */
    @core.TypedRoute.Get(":id")
    public async at(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("accountCode") accountCode: string,
      @core.TypedParam("id") id: string,
    ): Promise<IStudioEnterpriseTeam> {
      return StudioEnterpriseTeamProvider.at({
        actor,
        account: { code: accountCode },
        id,
      });
    }

    /**
     * View team details by code.
     *
     * View details of a specific {@link IStudioEnterpriseTeam team} configured by
     * {@link IStudioEnterprise} using the team's code (`code`).
     *
     * @param accountCode {@link IStudioAccount.code} of the affiliated company account
     * @param code {@link IStudioEnterpriseTeam.code} of the target team
     * @returns Team details
     * @author Asher
     * @tag Enterprise
     */
    @core.TypedRoute.Get(":code/get")
    public async get(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("accountCode") accountCode: string,
      @core.TypedParam("code") code: string,
    ): Promise<IStudioEnterpriseTeam> {
      actor;
      accountCode;
      code;
      return StudioEnterpriseTeamProvider.get({
        actor,
        account: { code: accountCode },
        code,
      });
    }
  }

  return StudioEnterpriseTeamController;
}
