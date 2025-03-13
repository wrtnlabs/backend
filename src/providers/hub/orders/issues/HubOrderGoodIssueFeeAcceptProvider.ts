import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { HubOrderGoodIssueErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderGoodIssueErrorCode";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubOrderGoodIssueFee } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssueFee";
import { IHubOrderGoodIssueFeeAccept } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssueFeeAccept";

import { HubGlobal } from "../../../../HubGlobal";
import { ErrorProvider } from "../../../common/ErrorProvider";
import { HubCustomerProvider } from "../../actors/HubCustomerProvider";
import { HubDepositHistoryProvider } from "../../deposits/HubDepositHistoryProvider";
import { HubOrderGoodIssueFeeProvider } from "./HubOrderGoodIssueFeeProvider";

export namespace HubOrderGoodIssueFeeAcceptProvider {
  export namespace json {
    export const transform = (
      input: Prisma.hub_order_good_issue_fee_acceptsGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubOrderGoodIssueFeeAccept => {
      return {
        id: input.id,
        customer: HubCustomerProvider.json.transform(input.customer),
        created_at: input.created_at.toISOString(),
        published_at: input.published_at?.toISOString(),
        canceled_at: input.cancelled_at?.toISOString(),
      };
    };
    export const select = () =>
      ({
        include: {
          customer: HubCustomerProvider.json.select(),
        },
      }) satisfies Prisma.hub_order_good_issue_fee_acceptsFindManyArgs;
  }

  export const create = async (props: {
    customer: IHubCustomer;
    order: IEntity;
    good: IEntity;
    issue: IEntity;
    fee: IEntity;
    input: IHubOrderGoodIssueFeeAccept.ICreate;
  }): Promise<IHubOrderGoodIssueFeeAccept> => {
    // VALIDATE CUSTOMER
    if (props.customer.citizen === null)
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_CITIZEN,
        message: "Only activated customer can accept fee.",
      });

    const member = props.customer.member;
    if (member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "Only activated member can accept fee.",
      });
    }

    // VALIDATE FEE INFO
    const fee: IHubOrderGoodIssueFee = await HubOrderGoodIssueFeeProvider.at({
      ...props,
      actor: props.customer,
      id: props.fee.id,
    });
    if (fee.accept !== null)
      throw ErrorProvider.gone({
        accessor: "id",
        code: HubOrderGoodIssueErrorCode.ISSUE_FEE_ALREADY_ACCEPTED,
        message: "Already accepted.",
      });

    // ARCHIVE ACCEPT RECORD
    const record = await HubDepositHistoryProvider.process({
      citizen: props.customer.citizen,
      deposit: { code: "hub_order_good_issue_fee_accept" },
      task: () =>
        HubGlobal.prisma.hub_order_good_issue_fee_accepts.create({
          data: {
            id: v4(),
            customer: {
              connect: { id: props.customer.id },
            },
            member: {
              connect: { id: member.id },
            },
            fee: {
              connect: { id: fee.id },
            },
            created_at: new Date(),
            published_at: new Date(props.input.published_at),
            cancelled_at: null,
          },
          ...json.select(),
        }),
      source: (accept) => ({
        id: accept.hub_order_good_issue_fee_id,
      }),
      value: fee.value,
    });

    // INCREASE AGGREGATION
    await HubGlobal.prisma.mv_hub_order_good_issue_fee_aggregates.update({
      where: {
        hub_order_good_issue_id: props.issue.id,
      },
      data: {
        accept_count: { increment: 1 },
        accept_amount: {
          increment: fee.value,
        },
      },
    });
    return json.transform(record);
  };

  export const cancel = async (props: {
    customer: IHubCustomer;
    order: IEntity;
    good: IEntity;
    issue: IEntity;
    fee: IEntity;
  }): Promise<void> => {
    // VALIDATE CUSTOMER
    if (props.customer.citizen === null)
      throw ErrorProvider.forbidden({
        accessor: "headers.Authorization",
        code: HubActorErrorCode.NOT_CITIZEN,
        message: "Only activated customer can accept fee.",
      });

    // VALIDATE FEE INFO
    const fee: IHubOrderGoodIssueFee = await HubOrderGoodIssueFeeProvider.at({
      ...props,
      actor: props.customer,
      id: props.fee.id,
    });
    if (fee.accept === null)
      throw ErrorProvider.unprocessable({
        accessor: "id",
        code: HubOrderGoodIssueErrorCode.ISSUE_FEE_NOT_ACCEPTED,
        message: "Not accepted yet.",
      });
    else if (fee.accept.canceled_at !== null)
      throw ErrorProvider.gone({
        accessor: "id",
        code: HubOrderGoodIssueErrorCode.ISSUE_FEE_ALREADY_CANCELLED,
        message: "Already canceled.",
      });
    else if (new Date(fee.accept.published_at).getTime() > Date.now())
      throw ErrorProvider.gone({
        accessor: "id",
        code: HubOrderGoodIssueErrorCode.ISSUE_FEE_ALREADY_PUBLISHED,
        message: "Already published.",
      });

    // ARCHIVE CANCEL RECORD
    const accept =
      await HubGlobal.prisma.hub_order_good_issue_fee_accepts.update({
        where: { id: fee.accept.id },
        data: {
          cancelled_at: new Date(),
        },
      });
    await HubDepositHistoryProvider.cancel({
      citizen: props.customer.citizen,
      deposit: { code: "hub_order_good_issue_fee_accept" },
      task: () =>
        HubGlobal.prisma.hub_order_good_issue_fee_accepts.update({
          where: { id: fee.accept!.id },
          data: {
            cancelled_at: new Date(),
          },
        }),
      source: () => ({ id: accept.hub_order_good_issue_fee_id }),
    });
  };
}
