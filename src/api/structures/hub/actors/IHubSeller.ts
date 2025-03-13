import { tags } from "typia";

import { IPage } from "../../common/IPage";
import { IHubCitizen } from "./IHubCitizen";
import { IHubCustomer } from "./IHubCustomer";
import { IHubMember } from "./IHubMember";

/**
 * Seller information.
 *
 * `IHubSeller` is an entity that literally means a seller, and refers to
 * a person who registers {@link IHubMember} in this system, registers
 * {@link IHubSale API listings}, and conducts {@link IHubOrder sales} activities.
 *
 * Note that `IHubSeller` is different from {@link IHubExternalUser external users}
 * and {@link IHubCustomer}, which allows non-member activities, and only those
 * who register as {@link IHubMember members} can conduct sales activities.
 * And {@link IHubCitizen real-name authentication} is also required.
 *
 * @author Samchon
 */
export interface IHubSeller {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * The date and time the record was created.
   */
  created_at: string & tags.Format<"date-time">;
}
export namespace IHubSeller {
  /**
   * Seller's reverse reference information.
   *
   * A data structure that lists seller information in reverse order, {@link IHubCustomer.member} -> {@link IHubMember.seller}. Starting with the administrator as the top-level object,
   * it reversely references citizen, general member, and customer information.
   */
  export interface IInvert extends IHubSeller {
    /**
     * Discriminator for the discriminated union type.
     */
    type: "seller";

    /**
     * General Member Information.
     *
     * To sign up as a seller member, you must first sign up as a general member.
     */
    member: IHubMember.IInvert;

    /**
     * Customer information.
     *
     * This system manages customers by connection unit.
     *
     * That is, connection information for current seller members.
     */
    customer: IHubCustomer.IInvert;

    /**
     * Citizen authentication information.
     *
     * Sellers must complete citizen authentication.
     */
    citizen: IHubCitizen | null;
  }

  /**
   * Search and page request information.
   */
  export interface IRequest extends IPage.IRequest {
    search?: IRequest.ISearch;
    sort?: IPage.Sort<IRequest.SortableColumns>;
  }
  export namespace IRequest {
    export interface ISearch {
      id?: string & tags.Format<"uuid">;
      mobile?: string & tags.Pattern<"^[0-9]*$">;
      name?: string;
      /**
       * Search only for `studio@wrtn.io` accounts.
       */
      show_wrtn?: boolean;
      email?: string & tags.Format<"email">;
      nickname?: string;
    }
    export type SortableColumns =
      | "seller.created_at"
      | "seller.goods.payments.real"
      | "seller.goods.published_count"
      | "seller.reviews.average"
      | "seller.reviews.count";
  }

  /**
   * Enter seller membership registration information.
   */
  export interface IJoin {
    //
    //  * 소속 회사 정보.
    //  */
    // company: null | IHubCompany.ICreate;
  }
}
