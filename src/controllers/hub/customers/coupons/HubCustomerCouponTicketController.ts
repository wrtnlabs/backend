import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCouponTicket } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponTicket";

import { HubCouponTicketProvider } from "../../../../providers/hub/coupons/HubCouponTicketProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";

@Controller("hub/customers/coupons/tickets")
export class HubCustomerCouponTicketController {
  /**
   * Bulk search for discount coupon tickets.
   *
   * Bulk search for discount coupon tickets held by customers.
   *
   * However, tickets that have already been used for order payment or
   * have expired are excluded.
   *
   * @param input Search and page request information
   * @returns List of paging tickets
   * @author Samchon
   * @tag Coupon
   */
  @core.TypedRoute.Patch()
  public index(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubCouponTicket.IRequest,
  ): Promise<IPage<IHubCouponTicket>> {
    return HubCouponTicketProvider.index({
      customer,
      input,
    });
  }

  /**
   * View individual discount coupon ticket information.
   *
   * View discount coupon ticket information held by the customer.
   *
   * However, tickets that have already been used for order payment or
   * have expired cannot be viewed.
   *
   * @param id {@link IHubCouponTicket.id} of the target ticket
   * @returns ticket information
   * @author Samchon
   * @tag Coupon
   */
  @core.TypedRoute.Get(":id")
  public at(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<IHubCouponTicket> {
    return HubCouponTicketProvider.at({
      customer,
      id,
    });
  }

  /**
   * Issue a ticket.
   *
   * The customer issues a ticket for a specific discount coupon.
   *
   * @param input Discount coupon ticket issuance application information
   * @returns Issued discount coupon ticket information
   * @author Samchon
   * @tag Coupon
   */
  @core.TypedRoute.Post()
  public create(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubCouponTicket.ICreate,
  ): Promise<IHubCouponTicket> {
    return HubCouponTicketProvider.create({
      customer,
      input,
    });
  }
}
