import { IAgenticaTokenUsage } from "@agentica/core";
import { Prisma } from "@prisma/client";
import typia from "typia";
import { v4 } from "uuid";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IStudioMetaChatServiceTokenUsage } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceTokenUsage";

import { HubGlobal } from "../../../HubGlobal";

export namespace StudioMetaChatSessionTokenUsageProvider {
  export namespace json {
    export const transformAll = (
      elements: Prisma.studio_meta_chat_session_token_usagesGetPayload<
        ReturnType<typeof select>
      >[],
    ): IStudioMetaChatServiceTokenUsage => {
      const take = (
        type: string,
      ): IStudioMetaChatServiceTokenUsage.IComponent => {
        const elem = elements.find((elem) => elem.type === type);
        return elem ? transform(elem) : zeroComponent();
      };
      return {
        aggregate: take("aggregate"),
        initialize: take("initialize"),
        select: take("select"),
        cancel: take("cancel"),
        call: take("call"),
        describe: take("describe"),
      };
    };
    export const transform = (
      input: Prisma.studio_meta_chat_session_token_usagesGetPayload<
        ReturnType<typeof select>
      >,
    ): IStudioMetaChatServiceTokenUsage.IComponent => ({
      total: input.input_total + input.output_total,
      input: {
        price: input.input_price,
        total: input.input_total,
        cached: input.input_cached,
      },
      output: {
        price: input.output_price,
        total: input.output_total,
        reasoning: input.output_reasoning ?? 0,
        accepted_prediction: input.output_accepted_prediction ?? 0,
        rejected_prediction: input.output_rejected_prediction ?? 0,
      },
    });
    export const select = () =>
      ({}) satisfies Prisma.studio_meta_chat_session_token_usagesFindManyArgs;
  }

  export const emplace = async (props: {
    session: IEntity;
    usage: IAgenticaTokenUsage;
  }): Promise<IStudioMetaChatServiceTokenUsage> => {
    const computed: IStudioMetaChatServiceTokenUsage = computeAll(props.usage);
    for (const [key, value] of Object.entries(computed)) {
      if (
        typia.is<IStudioMetaChatServiceTokenUsage.IComponent>(value) === false
      )
        continue;
      const properties = {
        input_price: value.input.price,
        input_total: value.input.total,
        input_cached: value.input.cached,
        output_price: value.output.price,
        output_total: value.output.total,
        output_reasoning: value.output.reasoning,
        output_accepted_prediction: value.output.accepted_prediction,
        output_rejected_prediction: value.output.rejected_prediction,
      } satisfies Prisma.studio_meta_chat_session_token_usagesUpdateArgs["data"];
      await HubGlobal.prisma.studio_meta_chat_session_token_usages.upsert({
        create: {
          id: v4(),
          studio_meta_chat_session_id: props.session.id,
          type: key,
          ...properties,
        },
        update: properties,
        where: {
          studio_meta_chat_session_id_type: {
            studio_meta_chat_session_id: props.session.id,
            type: key,
          },
        },
      });
    }
    return computed;
  };

  export const computeAll = (
    usage: IAgenticaTokenUsage,
  ): IStudioMetaChatServiceTokenUsage => ({
    aggregate: computeComponent(usage.aggregate),
    initialize: computeComponent(usage.initialize),
    select: computeComponent(usage.select),
    cancel: computeComponent(usage.cancel),
    call: computeComponent(usage.call),
    describe: computeComponent(usage.describe),
  });

  const computeComponent = (
    comp: IAgenticaTokenUsage.IComponent,
  ): IStudioMetaChatServiceTokenUsage.IComponent => {
    const input: number =
      (comp.input.total - comp.input.cached) * (2.5 / 1_000_000) +
      comp.input.cached * (1.25 / 1_000_000);
    const output: number = comp.output.total * (10.0 / 1_000_000);
    return {
      ...comp,
      input: {
        ...comp.input,
        price: input,
      },
      output: {
        ...comp.output,
        price: output,
      },
    };
  };

  export const zeroAll = (): IStudioMetaChatServiceTokenUsage => ({
    aggregate: zeroComponent(),
    initialize: zeroComponent(),
    select: zeroComponent(),
    cancel: zeroComponent(),
    call: zeroComponent(),
    describe: zeroComponent(),
  });

  export const zeroComponent =
    (): IStudioMetaChatServiceTokenUsage.IComponent => ({
      total: 0,
      input: {
        price: 0,
        total: 0,
        cached: 0,
      },
      output: {
        price: 0,
        total: 0,
        reasoning: 0,
        accepted_prediction: 0,
        rejected_prediction: 0,
      },
    });
}
