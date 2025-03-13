import { RandomGenerator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubSection } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubSection";

import { ConnectionPool } from "../../../../../ConnectionPool";

export const generate_random_section = async (
  pool: ConnectionPool,
  input?: Partial<IHubSection.ICreate>,
): Promise<IHubSection> => {
  const section: IHubSection =
    await HubApi.functional.hub.admins.systematic.sections.create(pool.admin, {
      code: RandomGenerator.alphabets(16),
      name: RandomGenerator.name(8),
      ...(input ?? {}),
    });
  return section;
};
