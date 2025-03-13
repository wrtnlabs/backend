import { InternalServerErrorException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubDepositDonation } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDepositDonation";

import { HubGlobal } from "../../../HubGlobal";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { HubAdministratorProvider } from "../actors/HubAdministratorProvider";
import { HubCitizenProvider } from "../actors/HubCitizenProvider";
import { HubDepositHistoryProvider } from "./HubDepositHistoryProvider";

export namespace HubDepositDonationProvider {
  /* -----------------------------------------------------------
        TRANSFORMERS
    ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_deposit_donationsGetPayload<ReturnType<typeof select>>,
    ): IHubDepositDonation => ({
      id: input.id,
      administrator: HubAdministratorProvider.invert.transform(
        input.customer,
        () =>
          new InternalServerErrorException(
            "The donation has not been registered by administrator.",
          ),
      ),
      citizen: HubCitizenProvider.json.transform(input.citizen),
      value: input.value,
      reason: input.reason,
      created_at: input.created_at.toISOString(),
    });
    export const select = () =>
      ({
        include: {
          customer: HubAdministratorProvider.invert.select(),
          citizen: HubCitizenProvider.json.select(),
        },
      }) satisfies Prisma.hub_deposit_donationsFindManyArgs;
  }

  export const index = (
    input: IHubDepositDonation.IRequest,
  ): Promise<IPage<IHubDepositDonation>> =>
    PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_deposit_donations,
      payload: json.select(),
      transform: json.transform,
    })({
      where: {
        AND: where(input.search),
      },
      orderBy: input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(input.sort)
        : [{ created_at: "desc" }],
    } satisfies Prisma.hub_deposit_donationsFindManyArgs)(input);

  const where = (input: IHubDepositDonation.IRequest.ISearch | undefined) =>
    [
      ...(input?.name?.length ? [{ citizen: { name: input.name } }] : []),
      ...(input?.mobile?.length ? [{ citizen: { name: input.mobile } }] : []),
      ...(input?.minimum !== undefined
        ? [{ value: { gte: input.minimum } }]
        : []),
      ...(input?.maximum !== undefined
        ? [{ value: { lte: input.maximum } }]
        : []),
      ...(input?.from !== undefined
        ? [{ created_at: { gte: input.from } }]
        : []),
      ...(input?.to !== undefined ? [{ created_at: { lte: input.to } }] : []),
    ] satisfies Prisma.hub_deposit_donationsWhereInput["AND"];

  const orderBy = (
    key: IHubDepositDonation.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "created_at"
      ? { created_at: value }
      : {
          value: value,
        }) satisfies Prisma.hub_deposit_donationsOrderByWithRelationInput;

  export const at = async (id: string): Promise<IHubDepositDonation> => {
    const record =
      await HubGlobal.prisma.hub_deposit_donations.findFirstOrThrow({
        where: { id },
        ...json.select(),
      });
    return json.transform(record);
  };

  export const create = async (props: {
    admin: IHubAdministrator.IInvert;
    input: IHubDepositDonation.ICreate;
  }) => {
    const citizen = await HubGlobal.prisma.hub_citizens.findFirstOrThrow({
      where: { id: props.input.citizen_id },
    });
    const record = await HubDepositHistoryProvider.process({
      citizen,
      deposit: { code: "hub_deposit_donation" },
      task: () =>
        HubGlobal.prisma.hub_deposit_donations.create({
          data: collect(props),
          ...json.select(),
        }),
      source: (entity) => entity,
      value: props.input.value,
    });
    return json.transform(record);
  };

  const collect = (props: {
    admin: IHubAdministrator.IInvert;
    input: IHubDepositDonation.ICreate;
  }) =>
    ({
      id: v4(),
      customer: {
        connect: {
          id: props.admin.customer.id,
        },
      },
      member: {
        connect: {
          id: props.admin.member.id,
        },
      },
      citizen: {
        connect: {
          id: props.input.citizen_id,
        },
      },
      value: props.input.value,
      reason: props.input.reason,
      created_at: new Date(),
    }) satisfies Prisma.hub_deposit_donationsCreateInput;
}
