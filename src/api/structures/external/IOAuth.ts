import { tags } from "typia";

import { IHubCustomer } from "../hub/actors/IHubCustomer";

export namespace IOAuth {
  export interface IUser {
    uid: string;
    email: string & tags.Format<"email">;
    nickname: string;
    name: string;
  }

  /**
   * Token information.
   */
  export interface IToken extends IHubCustomer.IToken {
    /**
     * identifying User Token. (For Apple)
     */
    id_token?: string;
  }
}
