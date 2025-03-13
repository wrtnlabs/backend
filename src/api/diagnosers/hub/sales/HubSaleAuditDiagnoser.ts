import { v4 } from "uuid";

import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubSaleAudit } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAudit";

export namespace HubSaleAuditDiagnoser {
  export const invert = (audit: IHubSaleAudit): IHubSaleAudit.IInvert => ({
    id: audit.id,
    created_at: audit.created_at,
    rejected_at: audit.rejections[0]?.created_at ?? null,
    approved_at: audit.approval?.created_at ?? null,
    administrator: audit.administrator,
  });

  export const preview =
    (administrator: IHubAdministrator.IInvert) =>
    (input: IHubSaleAudit.ICreate): IHubSaleAudit => ({
      id: v4(),
      administrator,
      emendations: [],
      rejections: [],
      approval: null,
      snapshots: [
        {
          id: v4(),
          title: input.title,
          body: input.body,
          format: input.format,
          files: input.files.map((file) => ({
            id: v4(),
            name: file.name,
            extension: file.extension,
            url: file.url,
            created_at: new Date(),
          })),
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
    });
}
