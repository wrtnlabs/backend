import typia from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";

export interface IHubAuthenticateKey {
  id: string & typia.tags.Format<"uuid">;

  title: string;

  value: string;

  expired_at?: string & typia.tags.Format<"date">;

  created_at: string & typia.tags.Format<"date-time">;
}

export namespace IHubAuthenticateKey {
  export interface ISearch extends IPage.IRequest {
    /**
     * Search information.
     */
    search?: IRequest.ISearch;

    /**
     * Sort criteria.
     */
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }

  export namespace IRequest {
    /**
     * Search criteria.
     */
    export interface ISearch {
      id?: string & typia.tags.Format<"uuid">;
      title?: string;
    }

    export type SortableColumns = "created_at";
  }

  export interface IRefresh {
    id: string & typia.tags.Format<"uuid">;
  }

  export interface ICreate {
    title?: string;
    channel_code: string;
    expired_at?: string & typia.tags.Format<"date">;
  }

  export interface IDelete {
    id: string & typia.tags.Format<"uuid">;
  }
}
