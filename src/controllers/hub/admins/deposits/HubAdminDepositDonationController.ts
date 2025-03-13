import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubDepositDonation } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDepositDonation";

import { HubDepositDonationProvider } from "../../../../providers/hub/deposits/HubDepositDonationProvider";

import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";

@Controller("hub/admins/deposits/donations")
export class HubAdminDepositDonationController {
  /**
   * Bulk inquiry of deposit donation history.
   *
   * {@link IHubAdministrator administrator} retrieves
   * {@link IHubDepositDonation donation history} for {@link IHubCustomer customer}.
   *
   * The returned information is {@link IPage paging} processed, and depending
   * on how the request information {@link IHubDepositDonation.IRequest} is set,
   * the number of records per page can be {@link IHubDepositDonation.IRequest.limit},
   * or only deposit donation history that satisfies a specific condition can be
   * {@link IHubDepositDonation.IRequest.search}, or
   * {@link IHubDepositDonation.IRequest.sort sort conditions} of deposit donation
   * history can be arbitrarily set.
   *
   * @param input page and search request information
   * @returns paging processed deposit contribution history list
   * @author Samchon
   * @tag Deposit
   */
  @core.TypedRoute.Patch()
  public index(
    @HubAdminAuth() _admin: IHubAdministrator.IInvert,
    @core.TypedBody() input: IHubDepositDonation.IRequest,
  ): Promise<IPage<IHubDepositDonation>> {
    return HubDepositDonationProvider.index(input);
  }

  /**
   * Check deposit donation history.
   *
   * Check the deposit donation history {@link IHubDepositDonation} individually.
   *
   * @param id {@link IHubDepositDonation.id} of the target donation history
   * @returns donation history information
   * @author Samchon
   * @tag Deposit
   */
  @core.TypedRoute.Get(":id")
  public at(
    @HubAdminAuth() _admin: IHubAdministrator.IInvert,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<IHubDepositDonation> {
    return HubDepositDonationProvider.at(id);
  }

  /**
   * Donate a deposit.
   *
   * {@link IHubAdministrator administrator} randomly donates a
   * {@link IHubDepositDonation deposit} to a specific customer
   * ({@link IHubCitizen citizen}).
   *
   * However, the administrator must write the
   * {@link IHubDepositDonation.reason reason} when donating a deposit.
   *
   * @param input Deposit donation input information
   * @returns Deposit donation details
   * @author Samchon
   * @tag Deposit
   */
  @core.TypedRoute.Post()
  public create(
    @HubAdminAuth() admin: IHubAdministrator.IInvert,
    @core.TypedBody() input: IHubDepositDonation.ICreate,
  ): Promise<IHubDepositDonation> {
    return HubDepositDonationProvider.create({
      admin,
      input,
    });
  }
}
