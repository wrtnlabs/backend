import { OpenApi } from "@samchon/openapi";
import "@wrtnlabs/schema";
import { tags } from "typia";

import { IHubSaleUnitHost } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitHost";

export interface IHubSaleSnapshotUnitSwagger {
  id: string & tags.Format<"uuid">;

  /**
   * Host information.
   */
  server: IHubSaleUnitHost;

  /**
   * Whether it's basic swagger or not.
   */
  original: boolean;

  /**
   * Language code.
   */
  lang_code: string | null;

  /**
   * Swagger info.
   */
  swagger: OpenApi.IDocument;
}
