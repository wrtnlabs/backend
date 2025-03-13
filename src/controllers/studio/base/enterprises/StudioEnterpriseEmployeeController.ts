import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IStudioEnterpriseEmployee } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseEmployee";

import { StudioEnterpriseEmployeeProvider } from "../../../../providers/studio/enterprise/StudioEnterpriseEmployeeProvider";

import { IHubControllerProps } from "../../../hub/base/IHubControllerProps";

export function StudioEnterpriseEmployeeController<
  Actor extends IHubActorEntity,
>(props: IHubControllerProps) {
  @Controller(`studio/${props.path}/enterprises/:accountCode/employees`)
  class StudioEnterpriseEmployeeController {
    /**
     * Retrieve the summary information list of corporate employees.
     *
     * All {@link IStudioEnterpriseEmployee.ISummary employee summary information}
     * belonging to a specific {@link IStudioEnterprise company} {@link IPage paging}
     * is retrieved.
     *
     * @param accountCode {@link IStudioAccount.code} of the corporate account
     * @param input Page and search request information
     * @returns List of paging employee summary information
     * @author Asher
     * @tag Enterprise
     */
    @core.TypedRoute.Patch()
    public async index(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("accountCode")
      accountCode: string,
      @core.TypedBody() input: IStudioEnterpriseEmployee.IRequest,
    ): Promise<IPage<IStudioEnterpriseEmployee.ISummary>> {
      return StudioEnterpriseEmployeeProvider.index({
        actor,
        account: { code: accountCode },
        input,
      });
    }

    /**
     * Get employee details.
     *
     * Get the details of a specific {@link IStudioEnterpriseEmployee employee}.
     *
     * @param accountCode {@link IStudioAccount.code} of the affiliated company account
     * @param id {@link IStudioEnterpriseEmployee.id} of the target employee
     * @returns employee details
     * @author Asher
     * @tag Enterprise
     */
    @core.TypedRoute.Get(":id")
    public async at(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("accountCode")
      accountCode: string,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IStudioEnterpriseEmployee> {
      return StudioEnterpriseEmployeeProvider.at({
        actor,
        account: { code: accountCode },
        id,
      });
    }
  }

  return StudioEnterpriseEmployeeController;
}
