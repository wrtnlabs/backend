import { IHubChannel } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannel";
import { IHubChannelCategory } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannelCategory";

import { HubChannelCategoryDiagnoser } from "./HubChannelCategoryDiagnoser";

export namespace HubChannelDiagnoser {
  export type Code = Map<string, Tuple>;
  export interface Tuple {
    channel: IHubChannel.IHierarchical;
    categories: Map<string, IHubChannelCategory.IHierarchical>;
  }

  export const associate = (channels: IHubChannel.IHierarchical[]): Code => {
    const output: Code = new Map();
    channels.forEach((channel) => {
      const categories: Map<string, IHubChannelCategory.IHierarchical> =
        new Map();
      HubChannelCategoryDiagnoser.associate(categories)(channel.categories),
        output.set(channel.code, { channel, categories });
    });
    return output;
  };
}
