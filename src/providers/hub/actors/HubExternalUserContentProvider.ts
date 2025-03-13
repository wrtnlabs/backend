import { Prisma } from "@prisma/client";
import std from "tstl";
import typia from "typia";
import { v4 } from "uuid";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubExternalUserContent } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubExternalUserContent";

import { HubGlobal } from "../../../HubGlobal";

export namespace HubExternalUserContentProvider {
  export namespace json {
    export const transform = (
      input: Prisma.hub_external_user_contentsGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubExternalUserContent => ({
      id: input.id,
      gender: input.gender
        ? typia.assert<IHubExternalUserContent.GenderType>(input.gender)
        : "none",
      jobs:
        input.jobs !== null
          ? input.jobs.split(/\s*,\s*(?![^()]*\))/).map((job) => job)
          : null,
      birthYear: input.birthYear ?? null,
      interests:
        input.interests !== null
          ? input.interests.split(/\s*,\s*(?![^()]*\))/)
          : null,
      provider: input.provider ?? null,
      purposes: input.purposes
        ? input.purposes.split(/\s*,\s*(?![^()]*\))/)
        : null,
    });

    export const select = () =>
      ({}) satisfies Prisma.hub_external_user_contentsFindManyArgs;
  }

  export const equals = (
    x: IHubExternalUserContent.ICreate,
    y: IHubExternalUserContent.ICreate,
  ): boolean =>
    x.provider === y.provider &&
    x.birthYear === y.birthYear &&
    x.gender === y.gender &&
    !!x.jobs === !!y.jobs &&
    std.ranges.equal(x.jobs ?? [], y.jobs ?? []) &&
    !!x.interests === !!y.interests &&
    std.ranges.equal(x.interests ?? [], y.interests ?? []) &&
    !!x.purposes === !!y.purposes &&
    std.ranges.equal(x.purposes ?? [], y.purposes ?? []);

  export const create = async (props: {
    external: IEntity;
    input: IHubExternalUserContent.ICreate;
  }): Promise<IHubExternalUserContent> => {
    const record = await HubGlobal.prisma.hub_external_user_contents.create({
      data: collect(props.input),
    });
    return json.transform(record);
  };

  export const collect = (input: IHubExternalUserContent.ICreate) =>
    ({
      id: v4(),
      jobs: input.jobs !== null ? input.jobs.toString() : null,
      gender: input.gender,
      birthYear: input.birthYear ?? null,
      interests: input.interests !== null ? input.interests.toString() : null,
      provider: input.provider,
      purposes: input.purposes !== null ? input.purposes.toString() : null,
      created_at: new Date(),
    }) satisfies Prisma.hub_external_user_contentsCreateWithoutHub_external_usersInput;
}
