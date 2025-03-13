import {
  ArrayUtil,
  GaffComparator,
  RandomGenerator,
  TestValidator,
} from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSection } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubSection";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";

export const test_api_hub_systematic_section_index_sort = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);
  await ArrayUtil.asyncRepeat(REPEAT)(async () => {
    const section: IHubSection =
      await HubApi.functional.hub.admins.systematic.sections.create(
        pool.admin,
        {
          code: RandomGenerator.alphabets(8),
          name: RandomGenerator.name(8),
        },
      );
    return section;
  });

  const validator = TestValidator.sort("sections.index")<
    IHubSection,
    IHubSection.IRequest.SortableColumns,
    IPage.Sort<IHubSection.IRequest.SortableColumns>
  >(async (input: IPage.Sort<IHubSection.IRequest.SortableColumns>) => {
    const page: IPage<IHubSection> =
      await HubApi.functional.hub.admins.systematic.sections.index(pool.admin, {
        limit: REPEAT,
        sort: input,
      });
    return page.data;
  });
  const components = [
    validator("section.code")(GaffComparator.strings((s) => s.code)),
    validator("section.name")(GaffComparator.strings((s) => s.name)),
    validator("section.created_at")(
      GaffComparator.strings((s) => s.created_at),
    ),
  ];
  for (const comp of components) {
    await comp("+");
    await comp("-");
  }
};
const REPEAT = 25;
