import { RandomGenerator } from "@nestia/e2e";
import { AesPkcs5 } from "@nestia/fetcher/lib/AesPkcs5";
import { Prisma } from "@prisma/client";
import PaymentAPI from "@samchon/payment-api";
import { IPaymentHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentHistory";
import { IPaymentWebhookHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentWebhookHistory";
import { v4 } from "uuid";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { HubDepositErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubDepositErrorCode";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubDepositChargePublish } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDepositChargePublish";

import { HubConfiguration } from "../../../HubConfiguration";
import { HubGlobal } from "../../../HubGlobal";
import { PaymentConfiguration } from "../../../PaymentConfiguration";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubCustomerProvider } from "../actors/HubCustomerProvider";
import { HubDepositHistoryProvider } from "./HubDepositHistoryProvider";

export namespace HubDepositChargePublishProvider {
  /* -----------------------------------------------------------
              TRANSFORMERS
          ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_deposit_charge_publishesGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubDepositChargePublish => ({
      id: input.id,
      created_at: input.created_at.toISOString(),
      paid_at: input.paid_at?.toISOString() ?? null,
      cancelled_at: input.cancelled_at?.toISOString() ?? null,
    });
    export const select = () =>
      ({}) satisfies Prisma.hub_deposit_charge_publishesFindManyArgs;
  }

  /* -----------------------------------------------------------
              READERS
          ----------------------------------------------------------- */
  export const able = async (props: {
    customer: IHubCustomer;
    charge: IEntity;
  }): Promise<boolean> => {
    const knock = await HubGlobal.prisma.hub_deposit_charges.findFirstOrThrow({
      where: {
        id: props.charge.id,
        customer: HubCustomerProvider.where(props.customer),
      },
      include: {
        publish: true,
      },
    });
    return knock.publish === null;
  };

  export const payment = async (charge: IEntity): Promise<IPaymentHistory> => {
    const knock = await HubGlobal.prisma.hub_deposit_charges.findFirstOrThrow({
      where: {
        id: charge.id,
      },
      include: {
        publish: true,
      },
    });
    if (knock.publish === null)
      throw ErrorProvider.unprocessable({
        accessor: "id",
        code: HubDepositErrorCode.NOT_PUBLISHED,
        message: "Not published yet",
      });
    return PaymentAPI.functional.payments.histories.get(
      PaymentConfiguration.connection(),
      {
        schema: "hub",
        table: HubGlobal.prisma.hub_deposit_charges.fields.id.modelName,
        id: knock.id,
        password: AesPkcs5.decrypt(
          knock.publish.password,
          HubGlobal.env.HUB_DEPOSIT_CHARGE_ENCRYPTION_KEY,
          HubGlobal.env.HUB_DEPOSIT_CHARGE_ENCRYPTION_IV,
        ),
      },
    );
  };

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const create = async (props: {
    customer: IHubCustomer;
    charge: IEntity;
    input: IHubDepositChargePublish.ICreate;
  }): Promise<IHubDepositChargePublish> => {
    if (props.customer.citizen === null)
      throw ErrorProvider.forbidden({
        accessor: "headers.Authorization",
        code: HubActorErrorCode.NOT_CITIZEN,
        message: "Only activated customer can publish.",
      });
    const knock = await HubGlobal.prisma.hub_deposit_charges.findFirstOrThrow({
      where: {
        id: props.charge.id,
        customer: HubCustomerProvider.where(props.customer),
      },
      include: {
        publish: true,
      },
    });
    if (knock.publish !== null)
      throw ErrorProvider.gone({
        accessor: "id",
        code: HubDepositErrorCode.ALREADY_PUBLISHED,
        message: "Already published.",
      });

    const password: string = RandomGenerator.alphaNumeric(32);
    const payment: IPaymentHistory =
      await PaymentAPI.functional.payments.histories.create(
        PaymentConfiguration.connection(),
        {
          vendor: props.input,
          source: {
            schema: "hub",
            table: HubGlobal.prisma.hub_deposit_charges.fields.id.modelName,
            id: props.charge.id,
          },
          price: knock.value,
          webhook_url: `${HubConfiguration.API_HOST()}/hub/customers/deposits/charges/${
            props.charge.id
          }/webhook`,
          password,
        },
      );
    const record = await HubGlobal.prisma.hub_deposit_charge_publishes.create({
      data: {
        id: v4(),
        charge: {
          connect: { id: props.charge.id },
        },
        password: AesPkcs5.encrypt(
          password,
          HubGlobal.env.HUB_DEPOSIT_CHARGE_ENCRYPTION_KEY,
          HubGlobal.env.HUB_DEPOSIT_CHARGE_ENCRYPTION_IV,
        ),
        created_at: new Date(),
        paid_at: payment.paid_at !== null ? new Date(payment.paid_at) : null,
        cancelled_at:
          payment.cancelled_at !== null ? new Date(payment.cancelled_at) : null,
      },
      ...json.select(),
    });
    if (record.paid_at !== null) {
      await handlePayment({
        charge: props.charge,
        time: record.paid_at,
      });
      if (record.cancelled_at !== null)
        await handleCancel({
          charge: props.charge,
          time: record.cancelled_at,
        });
    }
    return json.transform(record);
  };

  export const webhook = async (props: {
    charge: IEntity;
    input: IPaymentWebhookHistory;
  }): Promise<void> => {
    const previous =
      await HubGlobal.prisma.hub_deposit_charge_publishes.findFirstOrThrow({
        where: {
          hub_deposit_charge_id: props.charge.id,
        },
      });
    const paid: boolean =
      previous.paid_at === null && props.input.current.paid_at !== null;
    const cancelled: boolean =
      previous.cancelled_at === null &&
      props.input.current.cancelled_at !== null;
    if (paid)
      await handlePayment({
        charge: props.charge,
        time: new Date(props.input.current.paid_at!),
      });
    else if (cancelled)
      await handleCancel({
        charge: props.charge,
        time: new Date(props.input.current.cancelled_at!),
      });
  };

  const handlePayment = async (props: { charge: IEntity; time: Date }) => {
    const knock = await HubGlobal.prisma.hub_deposit_charges.findFirstOrThrow({
      where: {
        id: props.charge.id,
      },
      include: {
        customer: HubCustomerProvider.json.select(),
      },
    });
    await HubDepositHistoryProvider.process({
      citizen: knock.customer!.citizen!,
      deposit: { code: "hub_deposit_charge" },
      task: () =>
        HubGlobal.prisma.hub_deposit_charge_publishes.update({
          where: {
            hub_deposit_charge_id: props.charge.id,
          },
          data: {
            paid_at: props.time,
          },
        }),
      source: () => knock,
      value: knock.value,
    });
  };

  const handleCancel = async (props: { charge: IEntity; time: Date }) => {
    await HubGlobal.prisma.hub_deposit_charge_publishes.update({
      where: {
        hub_deposit_charge_id: props.charge.id,
      },
      data: {
        cancelled_at: props.time,
      },
    });
    const knock = await HubGlobal.prisma.hub_deposit_charges.findFirstOrThrow({
      where: {
        id: props.charge.id,
      },
      include: {
        customer: HubCustomerProvider.json.select(),
      },
    });
    await HubDepositHistoryProvider.cancel({
      citizen: knock.customer!.citizen!,
      deposit: { code: "hub_deposit_charge" },
      task: () =>
        HubGlobal.prisma.hub_deposit_charge_publishes.update({
          where: {
            hub_deposit_charge_id: props.charge.id,
          },
          data: {
            cancelled_at: props.time,
          },
        }),
      source: () => knock,
    });
  };
}
