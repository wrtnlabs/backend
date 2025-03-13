import typia from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";

export namespace HubSellerDiagnoser {
  export const invert = (customer: IHubCustomer): IHubSeller.IInvert | null => {
    //    const citizen = customer.citizen;
    const member = customer.member;
    const seller = customer.member?.seller;

    if (!member || !seller) return null; // TODO CITIZEN
    return {
      id: seller.id,
      type: "seller",
      citizen: member.citizen === null ? null : member.citizen,
      customer: typia.misc.assertClone<IHubCustomer.IInvert>(customer),
      member: typia.misc.assertClone<IHubMember.IInvert>(member),
      created_at: seller.created_at,
    };
  };
}
