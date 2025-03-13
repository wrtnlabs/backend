import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubDepositHistory } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDepositHistory";

import { HubDepositHistoryProvider } from "../../../../providers/hub/deposits/HubDepositHistoryProvider";
import { HubDepositProvider } from "../../../../providers/hub/deposits/HubDepositProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";

@Controller("hub/customers/deposits/histories")
export class HubCustomerDepositHistoryController {
  /**
   * Bulk inquiry of deposit/withdrawal history.
   *
   * Retrieves {@link IHubDepositHistory deposit/withdrawal history}
   * for the current customer.
   *
   * The returned information is {@link IPage paging} processed, and depending
   * on how the request information {@link IHubDepositHistory.IRequest} is set,
   * the number of records per page can be {@link IHubDepositHistory.IRequest.limit},
   * or {@link IHubDepositHistory.IRequest.search} only deposit/withdrawal history
   * that satisfies a specific condition,
   * or {@link IHubDepositHistory.IRequest.sort sort condition} of
   * deposit/withdrawal history can be arbitrarily set.
   *
   * @param input Page and search request information
   * @returns List of deposit/withdrawal history that has been paging processed
   * @author Samchon
   * @tag Deposit
   */
  @core.TypedRoute.Patch()
  public index(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubDepositHistory.IRequest,
  ): Promise<IPage<IHubDepositHistory>> {
    return HubDepositHistoryProvider.index({
      citizen: customer.citizen!,
      input,
    });
  }

  /**
   * Check deposit/withdrawal history.
   *
   * Check deposit/withdrawal history individually.
   *
   * @param id {@link IHubDepositHistory.id} of target deposit/withdrawal history
   * @returns deposit/withdrawal history information
   * @author Samchon
   * @tag Deposit
   */
  public at(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<IHubDepositHistory> {
    return HubDepositHistoryProvider.at({
      citizen: customer.citizen!,
      id,
    });
  }

  /**
   * Check the deposit balance.
   *
   * Check the total deposit balance of the current customer.
   *
   * @returns Total deposit balance
   * @author Samchon
   * @tag Deposit
   */
  @core.TypedRoute.Get("balance")
  public balance(@HubCustomerAuth() customer: IHubCustomer): Promise<number> {
    return HubDepositProvider.balance(customer.citizen!);
  }
}
