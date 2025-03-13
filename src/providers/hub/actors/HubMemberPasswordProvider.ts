import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";

import { HubGlobal } from "../../../HubGlobal";
import { BcryptUtil } from "../../../utils/BcryptUtil";
import { ErrorProvider } from "../../common/ErrorProvider";

export namespace HubMemberPasswordProvider {
  export const change = async (props: {
    customer: IHubCustomer;
    input: IHubMember.IPasswordChange;
  }): Promise<void> => {
    if (props.customer.member === null)
      throw ErrorProvider.forbidden({
        accessor: "headers.Authorization",
        code: HubActorErrorCode.NOT_MEMBER,
        message: "You're not a member.",
      });

    const member = await HubGlobal.prisma.hub_members.findFirstOrThrow({
      where: {
        id: props.customer.member.id,
      },
    });
    if (member?.password === null)
      throw ErrorProvider.forbidden({
        accessor: "input.email",
        code: HubActorErrorCode.NOT_MEMBER,
        message: "You're not a member.",
      });
    if (
      false ===
      (await BcryptUtil.equals({
        input: props.input.oldbie,
        hashed: member.password,
      }))
    )
      throw ErrorProvider.forbidden({
        accessor: "input.oldbie",
        code: HubActorErrorCode.PASSWORD_NOT_MATCHED,
        message: "Incorrect password.",
      });

    await HubGlobal.prisma.hub_members.update({
      where: {
        id: member.id,
      },
      data: {
        password: await BcryptUtil.hash(props.input.newbie),
      },
    });
  };
}
