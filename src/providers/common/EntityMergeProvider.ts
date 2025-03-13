import { Prisma } from "@prisma/client";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { IRecordMerge } from "@wrtnlabs/os-api/lib/structures/common/IRecordMerge";

import { HubGlobal } from "../../HubGlobal";
import { EntityUtil } from "../../utils/EntityUtil";
import { ErrorProvider } from "./ErrorProvider";

export namespace EntityMergeProvider {
  export const merge =
    (
      table: Prisma.ModelName,
      finder?: (input: IRecordMerge) => Promise<number>,
    ) =>
    async (input: IRecordMerge): Promise<void> => {
      // VALIDATE TABLE
      const primary: Prisma.DMMF.Field | undefined =
        Prisma.dmmf.datamodel.models
          .find((model) => model.name === table)
          ?.fields.find((field) => field.isId === true);
      if (primary === undefined)
        throw ErrorProvider.internal({
          code: CommonErrorCode.INVALID_TABLE,
          message: "Unable to find primary key.",
        });

      // FIND MATCHED RECORDS
      const count: number = finder
        ? await finder(input)
        : await (HubGlobal.prisma[table] as any).count({
            where: {
              [primary.name]: {
                in: [input.keep, ...input.absorbed],
              },
            },
          });
      if (count !== input.absorbed.length + 1)
        throw ErrorProvider.notFound({
          accessor: "input.keep | input.absorbed",
          code: CommonErrorCode.RECORD_NOT_FOUND,
          message: "Unable to find matched record.",
        });

      // DO MERGE
      await EntityUtil.merge(HubGlobal.prisma)(table)(input);
    };
}
