import { Prisma } from "@prisma/client";

import { IHubMemberEmail } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMemberEmail";

export namespace HubMemberEmailProvider {
  export namespace json {
    export const transform = (
      input: Prisma.hub_member_emailsGetPayload<ReturnType<typeof select>>,
    ): IHubMemberEmail => ({
      id: input.id,
      value: input.value,
      created_at: input.created_at.toISOString(),
    });
    export const select = () =>
      ({}) satisfies Prisma.hub_member_emailsFindManyArgs;
  }
}
