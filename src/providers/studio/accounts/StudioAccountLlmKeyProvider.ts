import { AesPkcs5 } from "@nestia/fetcher/lib/AesPkcs5";
import { Prisma } from "@prisma/client";
import typia from "typia";
import { v4 } from "uuid";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { ICodeEntity } from "@wrtnlabs/os-api/lib/structures/common/ICodeEntity";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioAccountLlmKey } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountLlmKey";

import { HubGlobal } from "../../../HubGlobal";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubCustomerProvider } from "../../hub/actors/HubCustomerProvider";
import { StudioAccountProvider } from "./StudioAccountProvider";

export namespace StudioAccountLlmKeyProvider {
  export namespace json {
    export const transform = (
      input: Prisma.studio_account_llm_keysGetPayload<
        ReturnType<typeof select>
      >,
    ): IStudioAccountLlmKey => ({
      id: input.id,
      customer: HubCustomerProvider.json.transform(input.customer),
      code: input.code,
      provider: typia.assert<IStudioAccountLlmKey.Provider>(input.provider),
      created_at: input.created_at.toISOString(),
      updated_at: input.updated_at.toISOString(),
    });
    export const select = () =>
      ({
        select: {
          id: true,
          customer: HubCustomerProvider.json.select(),
          code: true,
          provider: true,
          created_at: true,
          updated_at: true,
        },
      }) satisfies Prisma.studio_account_llm_keysFindManyArgs;
  }

  export const index = async (props: {
    account: ICodeEntity;
    actor: IHubActorEntity;
    input: IPage.IRequest;
  }): Promise<IPage<IStudioAccountLlmKey>> => {
    const account: IEntity = await StudioAccountProvider.find({
      payload: {},
      actor: props.actor,
      target: props.account,
      title: "member",
    });
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.studio_account_llm_keys,
      payload: json.select(),
      transform: json.transform,
    })({
      where: {
        studio_account_id: account.id,
      },
      orderBy: [{ created_at: "asc" }],
    } satisfies Prisma.studio_account_llm_keysFindManyArgs)(props.input);
  };

  export const emplace = async (props: {
    account: ICodeEntity;
    customer: IHubCustomer;
    input: IStudioAccountLlmKey.IEmplace;
  }): Promise<IStudioAccountLlmKey> => {
    if (props.customer.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "Only members can add LLM keys",
      });
    }

    const account: IEntity = await StudioAccountProvider.find({
      payload: {},
      actor: props.customer,
      target: props.account,
      title: "manager",
    });
    const record = await HubGlobal.prisma.studio_account_llm_keys.upsert({
      create: {
        id: v4(),
        studio_account_id: account.id,
        hub_customer_id: props.customer.id,
        hub_member_id: props.customer.member.id,
        code: props.input.code,
        provider: props.input.provider,
        value: AesPkcs5.encrypt(
          props.input.value,
          HubGlobal.env.STUDIO_ACCOUNT_LLM_KEY_ENCRYPTION_KEY,
          HubGlobal.env.STUDIO_ACCOUNT_LLM_KEY_ENCRYPTION_IV,
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      update: {},
      where: {
        studio_account_id_code: {
          studio_account_id: account.id,
          code: props.input.code,
        },
      },
      ...json.select(),
    });
    return json.transform(record);
  };

  export const invert = async (props: {
    customer: IHubCustomer;
    account: ICodeEntity;
    code: string;
  }): Promise<IStudioAccountLlmKey.IEmplace> => {
    const account: IEntity = await StudioAccountProvider.find({
      payload: {},
      actor: props.customer,
      target: props.account,
      title: "member",
    });
    const record =
      await HubGlobal.prisma.studio_account_llm_keys.findFirstOrThrow({
        where: {
          code: props.code,
          studio_account_id: account.id,
        },
      });
    return {
      provider: typia.assert<IStudioAccountLlmKey.Provider>(record.provider),
      code: record.code,
      value: AesPkcs5.decrypt(
        record.value,
        HubGlobal.env.STUDIO_ACCOUNT_LLM_KEY_ENCRYPTION_KEY,
        HubGlobal.env.STUDIO_ACCOUNT_LLM_KEY_ENCRYPTION_IV,
      ),
    };
  };

  export const erase = async (props: {
    account: ICodeEntity;
    customer: IHubCustomer;
    id: string;
  }): Promise<void> => {
    const account: IEntity = await StudioAccountProvider.find({
      payload: {},
      actor: props.customer,
      target: props.account,
      title: "member",
    });
    await HubGlobal.prisma.studio_account_llm_keys.delete({
      where: {
        id: props.id,
        studio_account_id: account.id,
      },
    });
  };
}
