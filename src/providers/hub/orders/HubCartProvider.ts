import { v4 } from "uuid";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";

import { HubGlobal } from "../../../HubGlobal";
import { HubCustomerProvider } from "../actors/HubCustomerProvider";

export namespace HubCartProvider {
  export const emplace = async (actor: IHubActorEntity): Promise<IEntity> => {
    const oldbie = await HubGlobal.prisma.hub_carts.findFirst({
      where: {
        ...(actor.type === "customer"
          ? {
              customer: HubCustomerProvider.where(actor),
            }
          : actor.type === "seller"
            ? {
                member: {
                  seller: {
                    id: actor.id,
                  },
                },
              }
            : {
                member: {
                  administrator: {
                    id: actor.id,
                  },
                },
              }),
        actor_type: actor.type,
        deleted_at: null,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    if (oldbie) return { id: oldbie.id };

    const newbie = await HubGlobal.prisma.hub_carts.create({
      data: {
        id: v4(),
        hub_customer_id:
          actor.type === "customer" ? actor.id : actor.customer.id,
        hub_member_id: actor.member === null ? null : actor.member.id,
        actor_type: actor.type,
        created_at: new Date(),
        deleted_at: null,
      },
    });
    return { id: newbie.id };
  };
}
