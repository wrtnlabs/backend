import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";

import { StudioEnterpriseProvider } from "../../../../providers/studio/enterprise/StudioEnterpriseProvider";

import { IHubControllerProps } from "../../../hub/base/IHubControllerProps";

export function StudioEnterpriseController<Actor extends IHubActorEntity>(
  props: IHubControllerProps,
) {
  @Controller(`studio/${props.path}/enterprises`)
  class StudioEnterpriseController {
    /**
     * View company details.
     *
     * View details of a specific {@link IStudioEnterprise company}.
     *
     * @param id of the target company {@link IStudioEnterprise.id}
     * @returns company details
     * @author Asher
     * @tag Enterprise
     */
    @core.TypedRoute.Get(":id")
    public async at(
      @props.AuthGuard() _actor: Actor,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IStudioEnterprise> {
      return StudioEnterpriseProvider.at(id);
    }

    /**
     * View company details (by account code).
     *
     * View details of a specific {@link IStudioEnterprise company} by the
     * {@link IStudioAccount.code code} of the account it belongs to.
     *
     * @param actor
     * @param accountCode {@link IStudioAccount.code} of the account belonging to the company
     * @returns company details
     * @author Asher
     * @tag Enterprise
     */
    @core.TypedRoute.Get(":accountCode/get")
    public async get(
      @props.AuthGuard() _actor: Actor,
      @core.TypedParam("accountCode") accountCode: string,
    ): Promise<IStudioEnterprise> {
      return StudioEnterpriseProvider.get(accountCode);
    }
  }

  return StudioEnterpriseController;
}
