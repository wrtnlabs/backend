import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { HubOrderPublishErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderPublishErrorCode";
import {
  HubOrderGoodDiagnoser,
  HubOrderPublishDiagnoser,
} from "@wrtnlabs/os-api/lib/diagnosers/hub";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubOrderPublish } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderPublish";

import { HubGlobal } from "../../../HubGlobal";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubCustomerProvider } from "../actors/HubCustomerProvider";

export namespace HubOrderPublishProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_order_publishesGetPayload<ReturnType<typeof select>>,
    ): IHubOrderPublish => ({
      id: input.id,
      created_at: input.created_at.toISOString(),
    });
    export const select = () =>
      ({}) satisfies Prisma.hub_order_publishesFindManyArgs;
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const able = async (props: {
    customer: IHubCustomer;
    order: IEntity;
  }): Promise<void> => {
    const reference = await HubGlobal.prisma.hub_orders.findFirstOrThrow({
      where: {
        id: props.order.id,
        customer: HubCustomerProvider.where(props.customer),
        cancelled_at: null,
      },
      include: {
        publish: true,
      },
    });
    if (reference.publish !== null)
      throw ErrorProvider.gone({
        accessor: "id",
        code: HubOrderPublishErrorCode.CREATED,
        message: "The order is already published",
      });

    // @todo -> 잔고 검증
  };

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const create = async (props: {
    customer: IHubCustomer;
    order: IEntity;
    input: IHubOrderPublish.ICreate;
  }): Promise<IHubOrderPublish> => {
    await able(props);
    const diagnoses: IDiagnosis[] = HubOrderPublishDiagnoser.validate(
      props.input,
    );
    if (diagnoses.length) throw ErrorProvider.unprocessable(diagnoses);

    const publish = await HubGlobal.prisma.hub_order_publishes.create({
      data: {
        id: v4(),
        hub_order_id: props.order.id,
        created_at: new Date(),
      },
      ...json.select(),
    });

    if (props.input.opened_at !== null || props.input.closed_at !== null)
      await HubGlobal.prisma.hub_order_goods.updateMany({
        where: {
          hub_order_id: props.order.id,
        },
        data: {
          opened_at:
            props.input.opened_at !== null
              ? props.input.opened_at === "now"
                ? new Date()
                : new Date(props.input.opened_at)
              : null,
          closed_at:
            props.input.closed_at !== null
              ? new Date(props.input.closed_at)
              : null,
        },
      });
    return json.transform(publish);
  };

  export const open = async (props: {
    customer: IHubCustomer;
    order: IEntity;
    input: IHubOrderPublish.IOpen;
  }): Promise<void> => {
    const current: ICurrent = await updatable(props);
    const diagnosis: IDiagnosis[] = HubOrderGoodDiagnoser._Validate_open({
      current: () => "id",
      entity: "Some good",
    })(current)(props.input);
    if (diagnosis.length) throw ErrorProvider.unprocessable(diagnosis);

    await HubGlobal.prisma.hub_order_goods.updateMany({
      where: {
        hub_order_id: props.order.id,
      },
      data: {
        opened_at:
          props.input.opened_at !== null
            ? props.input.opened_at === "now"
              ? new Date()
              : new Date(props.input.opened_at)
            : null,
      },
    });
  };

  export const close = async (props: {
    customer: IHubCustomer;
    order: IEntity;
    input: IHubOrderPublish.IClose;
  }): Promise<void> => {
    const current: ICurrent = await updatable(props);
    const diagnosis: IDiagnosis[] = HubOrderGoodDiagnoser._Validate_close({
      current: () => "id",
      entity: "Some good",
    })(current)(props.input);
    if (diagnosis.length) throw ErrorProvider.unprocessable(diagnosis);

    await HubGlobal.prisma.hub_order_goods.updateMany({
      where: {
        hub_order_id: props.order.id,
      },
      data: {
        closed_at:
          props.input.closed_at !== null
            ? new Date(props.input.closed_at)
            : null,
      },
    });
  };

  const updatable = async (props: {
    customer: IHubCustomer;
    order: IEntity;
  }): Promise<ICurrent> => {
    const reference = await HubGlobal.prisma.hub_orders.findFirstOrThrow({
      where: {
        id: props.order.id,
        ...(props.customer.member === null
          ? { customer: HubCustomerProvider.where(props.customer) }
          : {
              member: {
                id: props.customer.member.id,
              },
            }),
        cancelled_at: null,
      },
      include: {
        publish: true,
        goods: true,
      },
    });
    if (reference.publish === null)
      throw ErrorProvider.unprocessable({
        accessor: "id",
        code: HubOrderPublishErrorCode.NOT_CREATED,
        message: "The order has not been published yet",
      });

    return {
      opened_at:
        groupBy((x, y) => (x < y ? x : y))(
          reference.goods.map((good) => good.opened_at),
        )?.toISOString() ?? null,
      closed_at:
        groupBy((x, y) => (x < y ? x : y))(
          reference.goods.map((good) => good.closed_at),
        )?.toISOString() ?? null,
    };
  };
}

interface ICurrent {
  opened_at: string | null;
  closed_at: string | null;
}

const groupBy =
  (compare: (x: Date, y: Date) => Date) =>
  (times: Array<Date | null>): Date | null => {
    const filtered = times.filter((time) => time !== null) as Date[];
    return filtered.length === 0 ? null : filtered.reduce(compare);
  };
