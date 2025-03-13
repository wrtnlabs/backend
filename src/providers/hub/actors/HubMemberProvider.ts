import { Prisma } from "@prisma/client";
import typia from "typia";
import { v4 } from "uuid";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IHubCitizen } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCitizen";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";

import { HubGlobal } from "../../../HubGlobal";
import { BcryptUtil } from "../../../utils/BcryptUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubAdministratorProvider } from "./HubAdministratorProvider";
import { HubCitizenProvider } from "./HubCitizenProvider";
import { HubExternalUserProvider } from "./HubExternalUserProvider";
import { HubMemberEmailProvider } from "./HubMemberEmailProvider";
import { HubSellerProvider } from "./HubSellerProvider";

export namespace HubMemberProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_membersGetPayload<ReturnType<typeof select>>,
    ): IHubMember => ({
      ...invert.transform(input),
      citizen:
        input.citizen !== null
          ? HubCitizenProvider.json.transform(input.citizen)
          : null,
      seller:
        input.seller !== null
          ? HubSellerProvider.json.transform(input.seller)
          : null,
      administrator:
        input.administrator !== null
          ? HubAdministratorProvider.json.transform(input.administrator)
          : null,
    });
    export const select = () =>
      ({
        include: {
          citizen: HubCitizenProvider.json.select(),
          seller: HubSellerProvider.json.select(),
          administrator: HubAdministratorProvider.json.select(),
          emails: HubMemberEmailProvider.json.select(),
          external_user: HubExternalUserProvider.json.select(),
          account: true,
        },
      }) satisfies Prisma.hub_membersFindManyArgs;
  }

  export namespace invert {
    export const transform = (
      input: Prisma.hub_membersGetPayload<ReturnType<typeof select>>,
    ): IHubMember.IInvert => ({
      id: input.id,
      type: "member",
      account: input.account
        ? {
            id: input.account.id,
            code: input.account.code,
            created_at: input.account.created_at.toISOString(),
          }
        : null,
      profile_background_color: input.profile_background_color
        ? typia.assert<IHubMember.MemberColorType>(
            input.profile_background_color,
          )
        : null,
      emails: input.emails
        .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
        .map(HubMemberEmailProvider.json.transform),
      nickname: input.nickname,
      created_at: input.created_at.toISOString(),
    });
    export const select = () =>
      ({
        include: {
          citizen: HubCitizenProvider.json.select(),
          emails: HubMemberEmailProvider.json.select(),
          external_user: HubExternalUserProvider.json.select(),
          account: true,
        },
      }) satisfies Prisma.hub_membersFindManyArgs;
  }

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const join = async (props: {
    customer: IHubCustomer;
    input: IHubMember.IJoin;
  }): Promise<IHubCustomer> => {
    // PRE-CONDITIONS
    if (props.customer.member !== null)
      throw ErrorProvider.gone({
        code: HubActorErrorCode.ALREADY_JOINED_MEMBER,
        message: "Already joined.",
      });
    else if (
      props.customer.citizen !== null &&
      props.input.citizen !== null &&
      (props.input.citizen.mobile !== props.customer.citizen.mobile ||
        props.input.citizen.name !== props.customer.citizen.name)
    )
      throw ErrorProvider.conflict({
        code: HubActorErrorCode.DIFFERENT_CITIZEN,
        message: "Different citizen information.",
      });
    props.input.citizen ??= props.customer.citizen;

    // INSPECT DUPLICATES
    const diagnoses: IDiagnosis[] = [];
    const inspect = (closure: () => IDiagnosis) => (count: number) => {
      if (count !== 0) diagnoses.push(closure());
    };
    inspect(() => ({
      accessor: "input.nickname",
      code: HubActorErrorCode.DUPLICATED_NICKNAME,
      message: "Duplicated nickname exists.",
    }))(
      await HubGlobal.prisma.hub_members.count({
        where: {
          hub_channel_id: props.customer.channel.id,
          nickname: props.input.nickname,
        },
      }),
    );
    inspect(() => ({
      accessor: "input.citizen.mobile",
      code: HubActorErrorCode.DUPLICATED_MOBILE,
      message: "Duplicated citizen exists.",
    }))(
      props.input.citizen === null
        ? 0
        : await HubGlobal.prisma.hub_citizens.count({
            where: {
              hub_channel_id: props.customer.channel.id,
              mobile: props.input.citizen.mobile,
            },
          }),
    );
    if (diagnoses.length !== 0) throw ErrorProvider.conflict(diagnoses);

    if (
      props.input.password === null &&
      props.customer.external_user === null
    ) {
      throw ErrorProvider.badRequest({
        accessor: "input.password",
        code: HubActorErrorCode.NO_EXTERNAL_USER_NO_PASSWORD,
        message: "No external user, but password is missing",
      });
    }

    //
    const existEmail = await HubGlobal.prisma.hub_member_emails.findFirst({
      include: {
        member: json.select(),
      },
      where: {
        value: props.input.email,
        hub_channel_id: props.customer.channel.id,
      },
    });

    // Integrate
    if (existEmail) {
      return await integrate({
        customer: props.customer,
        input: {
          email: existEmail.value,
          password: props.input.password,
          member: {
            ...json.transform(existEmail.member),
            password: existEmail.member.password,
          },
        },
      });
    }

    // DO JOIN
    const record = await HubGlobal.prisma.hub_members.create({
      data: collect({
        customer: props.customer,
        citizen:
          props.customer.citizen ??
          (props.input.citizen !== null
            ? await HubCitizenProvider.create({
                channel: props.customer.channel,
                input: props.input.citizen,
              })
            : null),
        password:
          props.input.password !== null
            ? await BcryptUtil.hash(props.input.password)
            : null,
      })(props.input),
      ...json.select(),
    });

    if (props.customer.external_user !== null) {
      const externalUser = await HubGlobal.prisma.hub_external_users.findFirst({
        where: {
          application: props.customer.external_user.application,
          uid: props.customer.external_user.uid,
        },
      });

      if (externalUser === null) {
        throw ErrorProvider.notFound({
          code: HubActorErrorCode.EXTERNAL_USER_NOT_FOUND,
          message: "External User Not Found.",
        });
      }

      await HubGlobal.prisma.hub_external_users.update({
        where: {
          id: externalUser.id,
        },
        data: {
          member: { connect: { id: record.id } },
        },
      });
    }
    return returnsWithSigning(props.customer)(json.transform(record));
  };

  export const login = async (props: {
    customer: IHubCustomer;
    input: IHubMember.ILogin;
  }): Promise<IHubCustomer> => {
    // TRY LOGIN
    const record = await HubGlobal.prisma.hub_members.findFirst({
      where: {
        hub_channel_id: props.customer.channel.id,
        emails: {
          some: {
            value: props.input.email,
          },
        },
      },
      ...json.select(),
    });

    if (record === null) {
      throw ErrorProvider.notFound({
        accessor: "input.email",
        code: HubActorErrorCode.EMAIL_NOT_FOUND,
        message: "Unable to find the matched email.",
      });
    }

    if (props.customer.external_user !== null) {
      const external = await HubGlobal.prisma.hub_external_users.findFirst({
        where: { id: props.customer.external_user.id },
      });

      if (external === null) {
        throw ErrorProvider.forbidden({
          accessor: "customer.external_user",
          code: HubActorErrorCode.NOT_MEMBER,
          message: "You're not a member.",
        });
      }
    } else if (record.password !== null && props.input.password !== null) {
      const match = await BcryptUtil.equals({
        input: props.input.password,
        hashed: record.password,
      });
      if (!match) {
        throw ErrorProvider.forbidden({
          accessor: "input.password",
          code: HubActorErrorCode.PASSWORD_NOT_MATCHED,
          message: "Wrong password.",
        });
      }
    } else {
      throw ErrorProvider.forbidden({
        accessor: "customer.external_user & input.password",
        code: HubActorErrorCode.NOT_MEMBER,
        message: "External user is null And password is null.",
      });
    }

    // CONSIDER CITIZEN INFO
    const member: IHubMember = json.transform(record);
    if (
      props.customer.citizen !== null &&
      member.citizen !== null &&
      props.customer.citizen.id !== member.citizen.id
    )
      throw ErrorProvider.conflict({
        code: HubActorErrorCode.DIFFERENT_CITIZEN,
        message: "Different citizen information with customer and member.",
      });
    else if (props.customer.citizen !== null && member.citizen === null)
      await HubGlobal.prisma.hub_members.update({
        where: { id: member.id },
        data: { citizen: { connect: { id: props.customer.citizen.id } } },
      });

    // RETURNS
    return returnsWithSigning(props.customer)(member);
  };

  const returnsWithSigning =
    (customer: IHubCustomer) =>
    async (member: IHubMember): Promise<IHubCustomer> => {
      if (customer.citizen === null && member.citizen !== null) {
        await HubGlobal.prisma.hub_customers.update({
          where: { id: customer.id },
          data: {
            citizen: { connect: { id: member.citizen.id } },
            member: { connect: { id: member.id } },
          },
        });
        if (customer.external_user !== null)
          await HubGlobal.prisma.hub_external_users.update({
            where: { id: customer.external_user.id },
            data: {
              citizen: { connect: { id: member.citizen.id } },
            },
          });
      } else
        await HubGlobal.prisma.hub_customers.update({
          where: { id: customer.id },
          data: { member: { connect: { id: member.id } } },
        });

      const citizen = customer.citizen ?? member.citizen;
      return {
        ...customer,
        external_user:
          customer.external_user !== null
            ? {
                ...customer.external_user,
                citizen,
              }
            : null,
        member: {
          ...member,
          citizen,
        },
        citizen,
      };
    };

  const collect =
    (props: {
      customer: IHubCustomer;
      citizen: IHubCitizen | null;
      password: string | null;
    }) =>
    (input: Omit<IHubMember.IJoin, "citizen" | "password">) =>
      ({
        id: v4(),
        channel: {
          connect: { id: props.customer.channel.id },
        },
        citizen:
          props.citizen !== null
            ? {
                connect: { id: props.citizen.id },
              }
            : undefined,
        nickname: input.nickname,
        emails: {
          create: [
            {
              id: v4(),
              channel: {
                connect: { id: props.customer.channel.id },
              },
              value: input.email,
              created_at: new Date(),
            },
          ],
        },
        profile_background_color: typia.random<IHubMember.MemberColorType>(),
        password: props.password,
        created_at: new Date(),
        updated_at: new Date(),
        withdrawn_at: null,
      }) satisfies Prisma.hub_membersCreateInput;

  export const update = async (props: {
    customer: IHubCustomer;
    input: IHubMember.IUpdate;
  }): Promise<IHubMember> => {
    if (props.customer.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "Not a member.",
      });
    }

    const diagnoses: IDiagnosis[] = [];
    const inspect = (closure: () => IDiagnosis) => (count: number) => {
      if (count !== 0) diagnoses.push(closure());
    };
    inspect(() => ({
      accessor: "input.nickname",
      code: HubActorErrorCode.DUPLICATED_NICKNAME,
      message: "Duplicated nicknam exists.",
    }))(
      await HubGlobal.prisma.hub_members.count({
        where: {
          hub_channel_id: props.customer.channel.id,
          nickname: props.input.nickname,
        },
      }),
    );

    if (diagnoses.length !== 0) throw ErrorProvider.conflict(diagnoses);

    const record = await HubGlobal.prisma.hub_members.update({
      where: { id: props.customer.member.id },
      data: {
        nickname: props.input.nickname,
        updated_at: new Date(),
      },
      ...json.select(),
    });

    return json.transform(record);
  };

  /**
   * If user has same email with member, integrate to the member.
   *
   * In case of Local user, customer.external_user === null.
   * In case of External user, customer.external_user !== null.
   */
  export const integrate = async (props: {
    customer: IHubCustomer;
    input: {
      email: string;
      password: string | null;
      member: IHubMember & { password: string | null };
    };
  }): Promise<IHubCustomer> => {
    // Local Signin.
    if (props.customer.external_user === null) {
      if (props.input.member.password) {
        throw ErrorProvider.conflict({
          code: HubActorErrorCode.ALREADY_JOINED_MEMBER,
          message: "Already joined local member.",
        });
      }

      if (!props.input.password) {
        throw ErrorProvider.badRequest({
          accessor: "input.password",
          code: HubActorErrorCode.NO_EXTERNAL_USER_NO_PASSWORD,
          message: "Password is not nullable.",
        });
      }

      await HubGlobal.prisma.hub_members.update({
        data: {
          password: await BcryptUtil.hash(props.input.password),
        },
        where: {
          id: props.input.member.id,
        },
      });

      return returnsWithSigning(props.customer)(props.input.member);
    } else {
      // OAuth Signin.
      if (props.customer.external_user.member_id) {
        throw ErrorProvider.badRequest({
          accessor: "props.customer.external_user.member_id",
          code: HubActorErrorCode.ALREADY_JOINED_MEMBER,
          message: "External User is already joined member.",
        });
      }

      await HubGlobal.prisma.hub_external_users.update({
        where: {
          id: props.customer.external_user.id,
        },
        data: {
          member: { connect: { id: props.input.member.id } },
        },
      });

      return returnsWithSigning(props.customer)(props.input.member);
    }
  };

  /**
   * Local Signup.
   *
   * After verifying email, have to join within 5 minutes.
   */
  export const localJoin = async (props: {
    customer: IHubCustomer;
    input: IHubMember.IJoin;
  }) => {
    if (!props.input.code) {
      throw ErrorProvider.badRequest({
        accessor: "input.code",
        code: HubActorErrorCode.INVALID_EMAIL_VERIFICATION_CODE,
        message: "Please enter the verification code.",
      });
    }

    const verification =
      await HubGlobal.prisma.hub_customer_email_verifications.findFirst({
        where: {
          hub_channel_id: props.customer.channel.id,
          hub_customer_id: props.customer.id,
          email: props.input.email,
          type: "sign-up" satisfies IHubCustomer.IEmailVerificationType,
          code: props.input.code,
          deleted_at: null,
        },
        orderBy: { created_at: "desc" },
      });

    if (!verification) {
      throw ErrorProvider.notFound({
        code: HubActorErrorCode.EMAIL_VERIFICATION_NOT_FOUND,
        message: "Verification not found.",
      });
    }
    if (!verification.verified_at) {
      throw ErrorProvider.badRequest({
        code: HubActorErrorCode.INVALID_EMAIL_VERIFICATION,
        message: "Verification not verified.",
      });
    }

    const now = new Date();

    // After five minutes of email verification, that verification will not be available.
    const expired_at = new Date(
      verification.verified_at.getTime() + 5 * 60 * 1000,
    );

    if (expired_at < now) {
      throw ErrorProvider.badRequest({
        code: HubActorErrorCode.EXPIRED_EMAIL_VERIFICATION,
        message: "Verification Expired.",
      });
    }

    const joinedCustomer = await join(props);

    await HubGlobal.prisma.hub_customer_email_verifications.update({
      data: {
        deleted_at: now.toISOString(),
      },
      where: {
        id: verification.id,
      },
    });

    return joinedCustomer;
  };
}
