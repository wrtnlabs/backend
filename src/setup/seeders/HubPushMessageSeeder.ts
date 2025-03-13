import fs from "fs";

import { HubPushMessageProvider } from "../../providers/hub/messages/HubPushMessageProvider";

import { HubConfiguration } from "../../HubConfiguration";

export namespace HubPushMessageSeeder {
  export const seed = async (): Promise<void> => {
    await HubPushMessageProvider.csv({
      admin: null,
      file: new File(
        [
          await fs.promises.readFile(
            `${HubConfiguration.ROOT}/assets/raw/raw_hub_push_messages.csv`,
          ),
        ],
        "raw_hub_push_messages.csv",
      ),
    });
  };
}
