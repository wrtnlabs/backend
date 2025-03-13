import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCouponTicket } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponTicket";
import { IHubCouponTicketPayment } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponTicketPayment";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";

import { HubGlobal } from "../../../HubGlobal";
import { HubCouponTicketProvider } from "./HubCouponTicketProvider";

export namespace HubCouponTicketPaymentProvider {
  export namespace json {
    export const transform = async (
      input: Prisma.hub_coupon_ticket_paymentsGetPayload<
        ReturnType<typeof select>
      >,
      lang_code: IHubCustomer.LanguageType,
    ): Promise<IHubCouponTicketPayment> => ({
      id: input.id,
      ticket: await HubCouponTicketProvider.json.transform(
        input.ticket,
        lang_code,
      ),
      created_at: input.created_at.toISOString(),
    });
    export const select = (actor: IHubActorEntity) =>
      ({
        include: {
          ticket: HubCouponTicketProvider.json.select(actor),
        },
      }) satisfies Prisma.hub_coupon_ticket_paymentsFindManyArgs;
  }

  export const create = async (props: {
    order: IHubOrder;
    ticket: IHubCouponTicket;
    sequence: number;
  }): Promise<IHubCouponTicketPayment> => {
    const record = await HubGlobal.prisma.hub_coupon_ticket_payments.create({
      data: {
        id: v4(),
        order: {
          connect: { id: props.order.id },
        },
        ticket: {
          connect: { id: props.ticket.id },
        },
        sequence: props.sequence,
        created_at: new Date(props.ticket.created_at),
      },
    });
    return {
      id: record.id,
      ticket: props.ticket,
      created_at: record.created_at.toISOString(),
    };
  };
}
