import { RandomGenerator } from "@nestia/e2e";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

import { HubGlobal } from "../../../HubGlobal";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubEmailProvider } from "../emails/HubEmailProvider";

export namespace HubCustomerEmailVerificationProvider {
  export namespace json {
    export const select = () =>
      ({}) satisfies Prisma.hub_customer_email_verificationsFindManyArgs;
  }

  /**
   * Send email with verification code.
   *
   * Only the last email sent is valid.
   */
  export const send = async (props: {
    customer: IHubCustomer;
    input: IHubCustomer.IEmail;
  }) => {
    if (props.input.type === "sign-up") {
      await sendSignup(props);
    } else {
      throw new Error();
    }
  };

  /**
   * Verify email.
   *
   * Only the last email sent is valid.
   * Verify whether the same customer.
   */
  export const verify = async (props: {
    customer: IHubCustomer;
    input: IHubCustomer.IVerifyEmail;
  }) => {
    const now = new Date();

    const verification =
      await HubGlobal.prisma.hub_customer_email_verifications.findFirst({
        where: {
          email: props.input.email,
          type: props.input.type,
          hub_channel_id: props.customer.channel.id,
          hub_customer_id: props.customer.id,
          expired_at: { gt: now.toISOString() },
          verified_at: null,
          deleted_at: null,
        },
        orderBy: {
          created_at: "desc",
        },
      });

    if (!verification) {
      throw ErrorProvider.notFound({
        code: HubActorErrorCode.EMAIL_VERIFICATION_NOT_FOUND,
        message: "Verification not found.",
      });
    }
    if (verification.code !== props.input.code) {
      throw ErrorProvider.badRequest({
        code: HubActorErrorCode.INVALID_EMAIL_VERIFICATION_CODE,
        message: "Verification Code is not valid",
      });
    }

    await HubGlobal.prisma.hub_customer_email_verifications.update({
      data: {
        verified_at: now.toISOString(),
      },
      where: {
        id: verification.id,
      },
    });
  };

  export const sendSignup = async (props: {
    customer: IHubCustomer;
    input: IHubCustomer.IEmail;
  }): Promise<void> => {
    const existEmail = await HubGlobal.prisma.hub_member_emails.findFirst({
      include: {
        member: true,
      },
      where: {
        value: props.input.email,
        hub_channel_id: props.customer.channel.id,
      },
    });

    // If password not null, already local joined.
    if (existEmail?.member.password) {
      throw ErrorProvider.conflict({
        code: HubActorErrorCode.ALREADY_JOINED_MEMBER,
        message: "Already Joined Member.",
      });
    }

    const now = new Date();
    // expired in 5 minutes.
    const expired_at = new Date(now.getTime() + 5 * 60 * 1000);

    const code = RandomGenerator.alphaNumeric(6);

    await HubGlobal.prisma.hub_customer_email_verifications.create({
      data: {
        id: v4(),
        code,
        email: props.input.email,
        created_at: now.toISOString(),
        expired_at: expired_at.toISOString(),
        type: props.input.type,
        hub_channel_id: props.customer.channel.id,
        hub_customer_id: props.customer.id,
        hub_member_id: props.customer.member?.id ?? null,
      },
      ...json.select(),
    });

    HubGlobal.testing === false
      ? await HubEmailProvider.send({
          to: props.input.email,
          subject: `Sign Up Email Verification`,
          text: `${code}`,
        })
      : undefined;
  };
}
