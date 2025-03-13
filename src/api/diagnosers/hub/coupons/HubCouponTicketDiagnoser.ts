import { IHubCouponTicket } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponTicket";

export namespace HubCouponTicketDiagnoser {
  export const unique = (tickets: IHubCouponTicket[]): IHubCouponTicket[] => [
    ...new Map(tickets.map((t) => [t.coupon.id, t])).values(),
  ];
}
