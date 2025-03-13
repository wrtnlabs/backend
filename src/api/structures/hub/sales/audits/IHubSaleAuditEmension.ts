import { tags } from "typia";

import { IHubAdministrator } from "../../actors/IHubAdministrator";
import { IHubSeller } from "../../actors/IHubSeller";

export interface IHubSaleAuditEmension {
  id: string & tags.Format<"uuid">;

  emender: IHubAdministrator.IInvert | IHubSeller.IInvert;

  source_snapshot_id: string & tags.Format<"uuid">;

  emended_snapshot_id: string & tags.Format<"uuid">;

  description: null | string;
}
export namespace IHubSaleAuditEmension {
  export interface ICreate {
    description: null | string;
    source_id: string & tags.Format<"uuid">;
  }
}
