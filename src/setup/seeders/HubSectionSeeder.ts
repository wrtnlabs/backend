import { IHubSection } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubSection";

import { HubSectionProvider } from "../../providers/hub/systematic/HubSectionProvider";

export namespace HubSectionSeeder {
  export const seed = async (): Promise<void> => {
    for (const input of DATA) await HubSectionProvider.create(input);
  };
}

const DATA: IHubSection.ICreate[] = [
  {
    code: "generative",
    name: "Generative AI",
  },
  {
    code: "studio",
    name: "Studio Workflow/Connector",
  },
];
