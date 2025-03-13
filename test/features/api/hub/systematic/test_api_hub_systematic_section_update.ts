import { RandomGenerator, TestValidator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api";
import { IHubSection } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubSection";

import { ConnectionPool } from "../../../../ConnectionPool";
import { test_api_hub_admin_login } from "../actors/test_api_hub_admin_login";
import { generate_random_section } from "./internal/generate_random_section";

export const test_api_hub_systematic_section_update = async (
  pool: ConnectionPool,
): Promise<void> => {
  await test_api_hub_admin_login(pool);

  const section: IHubSection = await generate_random_section(pool);
  const input: IHubSection.IUpdate = {
    name: RandomGenerator.name(8),
  };
  await HubApi.functional.hub.admins.systematic.sections.update(
    pool.admin,
    section.id,
    input,
  );

  const read: IHubSection =
    await HubApi.functional.hub.admins.systematic.sections.at(
      pool.admin,
      section.id,
    );
  TestValidator.equals("update")({
    ...input,
    id: section.id,
    created_at: section.created_at,
  })(read);
};
