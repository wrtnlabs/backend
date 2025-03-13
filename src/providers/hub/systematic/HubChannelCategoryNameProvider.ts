import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

export namespace HubChannelCategoryNameProvider {
  export const collect = (props: { name: string; lang_code: string }) =>
    ({
      id: v4(),
      name: props.name,
      lang_code: props.lang_code,
    }) satisfies Prisma.hub_channel_category_namesCreateWithoutCategoryInput;
}
