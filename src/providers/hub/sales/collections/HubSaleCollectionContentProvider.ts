import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubSaleCollection } from "@wrtnlabs/os-api/lib/structures/hub/sales/collections/IHubSaleCollection";

import { HubGlobal } from "../../../../HubGlobal";
import { TranslateService } from "../../../../services/TranslateService";
import { LanguageUtil } from "../../../../utils/LanguageUtil";

export namespace HubSaleCollectionContentProvider {
  export namespace json {
    export const select = () =>
      ({}) as Prisma.hub_sale_collection_contentsFindManyArgs;

    export const transform = (
      input: Prisma.hub_sale_collection_contentsGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubSaleCollection.IContent => ({
      title: input.title,
      body: input.body,
      format: input.format as "txt",
      summary: input.summary,
      lang_code: input.lang_code,
    });
  }

  export const selectWithWhere = <
    Selector extends Prisma.hub_sale_collection_contentsFindManyArgs,
  >(
    selector: Selector,
    actor: IHubActorEntity | null,
  ) => {
    const langCode = LanguageUtil.getNonNullActorLanguage(actor);

    return {
      ...selector,
      where: {
        lang_code: langCode,
      },
    } satisfies Prisma.hub_sale_collection_contentsFindManyArgs;
  };

  export const collect = (input: IHubSaleCollection.IContent) =>
    ({
      id: v4(),
      title: input.title,
      summary: input.summary,
      body: input.body,
      format: input.format,
      lang_code: input.lang_code,
    }) satisfies Prisma.hub_sale_collection_contentsCreateWithoutCollectionInput;

  export const emplace = async (props: {
    collection: IEntity;
    langCode: string;
  }): Promise<IHubSaleCollection.IContent> => {
    const base = json.transform(
      await HubGlobal.prisma.hub_sale_collection_contents.findFirstOrThrow({
        where: {
          hub_sale_collection_id: props.collection.id,
        },
      }),
    );

    const translated = await TranslateService.api.translate({
      target: props.langCode,
      input: {
        title: base.title,
        summary: base.summary,
        body: base.body ?? null,
      },
    });

    const newbie = await HubGlobal.prisma.hub_sale_collection_contents.create({
      data: {
        ...collect({
          ...translated,
          format: "txt",
          lang_code: props.langCode,
        }),
        hub_sale_collection_id: props.collection.id,
      },
    });

    return json.transform(newbie);
  };
}
