import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubDeposit } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDeposit";

import { HubDepositProvider } from "../../../../providers/hub/deposits/HubDepositProvider";

import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";

@Controller("hub/admins/deposits")
export class HubAdminDepositController {
  /**
   * Bulk search for deposit meta information.
   *
   * All deposit meta information existing in this hub system is searched in bulk.
   *
   * The returned information is processed with {@link IPage paging}, and depending
   * on how the request information {@link IHubDeposit.IRequest} is set, the number
   * of records per page can be {@link IHubDeposit.IRequest.limit}, or only deposit
   * meta information satisfying a specific condition can be
   * {@link IHubDeposit.IRequest.search}, or
   * {@link IHubDeposit.IRequest.sort sorting conditions} of deposit meta information
   * can be arbitrarily set.
   *
   * @param input
   * @returns
   * @author Samchon
   * @tag Deposit
   */
  @core.TypedRoute.Patch()
  public index(
    @HubAdminAuth() _admin: IHubAdministrator.IInvert,
    @core.TypedBody() input: IHubDeposit.IRequest,
  ): Promise<IPage<IHubDeposit>> {
    return HubDepositProvider.index(input);
  }

  /**
   * Individually query deposit meta information.
   *
   * Individually query deposit meta information {@link IHubDeposit}.
   *
   * @param id {@link IHubDeposit.id} of target deposit meta information
   * @returns deposit meta information
   * @author Samchon
   * @tag Deposit
   */
  @core.TypedRoute.Get(":id")
  public at(
    @HubAdminAuth() _admin: IHubAdministrator.IInvert,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<IHubDeposit> {
    return HubDepositProvider.at(id);
  }

  /**
   * Registering deposit meta information.
   *
   * Register a new deposit meta information {@link IHubDeposit}. This is the same
   * as registering a new {@link IHubDepositHistory deposit deposit/withdrawal}
   * reason.
   *
   * Of course, registering this record does not mean that the deposit will be
   * automatically deposited/withdrawn immediately for that reason. The deposit
   * deposit/withdrawal must be implemented as actual backend logic.
   *
   * @param input Deposit meta information input information
   * @returns Deposit meta information
   * @author Samchon
   * @tag Deposit
   */
  @core.TypedRoute.Post()
  public create(
    @HubAdminAuth() admin: IHubAdministrator.IInvert,
    @core.TypedBody() input: IHubDeposit.ICreate,
  ): Promise<IHubDeposit> {
    return HubDepositProvider.create({
      admin,
      input,
    });
  }

  /**
   * Delete deposit meta information.
   *
   * Delete the deposit meta information {@link IHubDeposit}. This will prevent
   * the deposit from being deposited or withdrawn {@link IHubDepositHistory}
   * for that reason.
   *
   * @param id {@link IHubDeposit.id} of the target deposit meta information
   * @author Samchon
   * @tag Deposit
   */
  @core.TypedRoute.Delete(":id")
  public erase(
    @HubAdminAuth() _admin: IHubAdministrator.IInvert,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return HubDepositProvider.erase(id);
  }
}
