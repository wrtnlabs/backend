import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IRecordMerge } from "@wrtnlabs/os-api/lib/structures/common/IRecordMerge";
import { IHubSection } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubSection";

import { HubGlobal } from "../../../HubGlobal";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { EntityMergeProvider } from "../../common/EntityMergeProvider";

export namespace HubSectionProvider {
  /* -----------------------------------------------------------
        TRANSFORMERS
    ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_sectionsGetPayload<ReturnType<typeof select>>,
    ): IHubSection => ({
      id: input.id,
      code: input.code,
      name: input.name,
      created_at: input.created_at.toISOString(),
    });
    export const select = () => ({}) satisfies Prisma.hub_sectionsFindManyArgs;
  }

  /* -----------------------------------------------------------
        READERS
    ----------------------------------------------------------- */
  export const index = (
    input: IHubSection.IRequest,
  ): Promise<IPage<IHubSection>> =>
    PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_sections,
      payload: json.select(),
      transform: json.transform,
    })({
      where: {
        AND: search(input.search),
      },
      orderBy: input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(input.sort)
        : [{ created_at: "asc" }],
    } satisfies Prisma.hub_sectionsFindManyArgs)(input);

  export const search = (input: IHubSection.IRequest.ISearch | undefined) =>
    [
      ...(input?.code?.length ? [{ code: { contains: input.code } }] : []),
      ...(input?.name?.length
        ? [
            {
              name: {
                contains: input.name,
                mode: "insensitive" as const,
              },
            },
          ]
        : []),
    ] satisfies Prisma.hub_sectionsWhereInput["AND"];

  export const orderBy = (
    key: IHubSection.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "section.code"
      ? { code: value }
      : key === "section.name"
        ? { name: value }
        : {
            created_at: value,
          }) satisfies Prisma.hub_sectionsOrderByWithRelationInput;

  export const at = async (id: string): Promise<IHubSection> => {
    const record = await HubGlobal.prisma.hub_sections.findFirstOrThrow({
      where: { id },
    });
    return json.transform(record);
  };

  export const get = async (code: string): Promise<IHubSection> => {
    const record = await HubGlobal.prisma.hub_sections.findFirstOrThrow({
      where: { code },
    });
    return json.transform(record);
  };

  /* -----------------------------------------------------------
        WRITERS
    ----------------------------------------------------------- */
  export const create = async (
    input: IHubSection.ICreate,
  ): Promise<IHubSection> => {
    const record = await HubGlobal.prisma.hub_sections.create({
      data: collect(input),
      ...json.select(),
    });
    return json.transform(record);
  };

  export const update = async (props: {
    id: string;
    input: IHubSection.IUpdate;
  }) => {
    const record = await HubGlobal.prisma.hub_sections.findFirstOrThrow({
      where: { id: props.id },
    });
    await HubGlobal.prisma.hub_sections.update({
      where: { id: record.id },
      data: {
        name: props.input.name,
      },
    });
  };

  export const merge = (input: IRecordMerge) =>
    EntityMergeProvider.merge(
      HubGlobal.prisma.hub_sections.fields.id.modelName,
    )(input);

  const collect = (input: IHubSection.ICreate) =>
    ({
      id: v4(),
      code: input.code,
      name: input.name,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    }) satisfies Prisma.hub_sectionsCreateInput;
}
