import core from "@nestia/core";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IStudioEnterprise } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterprise";

import { StudioEnterpriseProvider } from "../../../../providers/studio/enterprise/StudioEnterpriseProvider";

import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { StudioEnterpriseController } from "../../base/enterprises/StudioEnterpriseController";

export class StudioAdminEnterpriseController extends StudioEnterpriseController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {
  /**
   * Retrieve the list of corporate summary information.
   *
   * All {@link IStudioEnterprise.ISummary corporate summary information}
   * existing in this studio system {@link IPage paging processing} is retrieved.
   *
   * @param input Page and search request information
   * @returns List of paging-processed corporate summary information
   * @author Asher
   * @tag Enterprise
   */
  @core.TypedRoute.Patch()
  public async index(
    @HubAdminAuth() _admin: IHubAdministrator.IInvert,
    @core.TypedBody() input: IStudioEnterprise.IRequest,
  ): Promise<IPage<IStudioEnterprise.ISummary>> {
    return StudioEnterpriseProvider.index(input);
  }
}
