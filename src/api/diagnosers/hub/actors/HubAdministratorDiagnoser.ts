import typia from "typia";

import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";

export namespace HubAdministratorDiagnoser {
  export const invert = (
    customer: IHubCustomer,
  ): IHubAdministrator.IInvert | null => {
    const citizen = customer.citizen;
    const member = customer.member;
    const admin = customer.member?.administrator;

    if (!member || !admin) return null; // CITIZEN 인증 삭제
    return {
      id: admin.id,
      type: "administrator",
      citizen,
      customer: typia.misc.assertClone<IHubCustomer.IInvert>(customer),
      member: typia.misc.assertClone<IHubMember.IInvert>(member),
      created_at: admin.created_at,
    };
  };
}
