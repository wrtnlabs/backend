import { tags } from "typia";

import { IHubCitizen } from "./IHubCitizen";
import { IHubCustomer } from "./IHubCustomer";
import { IHubMember } from "./IHubMember";

/**
 * Administrator.
 *
 * `IHubAdministrator` is an entity that literally means an administrator,
 * and refers to a person who has registered as a {@link IHubMember member}
 * in this system and performs management activities such as
 * {@link IHubSaleAudit review}.
 *
 * Note that `IHubAdministrator` is different from
 * {@link IHubExternalUser external user} or {@link IHubCustomer} that can perform
 * non-member activities, but only those who have registered as a
 * {@link IHubMember member} can perform management activities. And
 * {@link IHubCitizen real-name authentication} is also required.
 *
 * @author Samchon
 */
export interface IHubAdministrator {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Administrator membership registration date and time.
   */
  created_at: string & tags.Format<"date-time">;
}
export namespace IHubAdministrator {
  /**
   * Administrator's reverse reference information.
   *
   * A data structure that lists administrator information in reverse order,
   * {@link IHubCustomer.member} -> {@link IHubMember.administrator}. Starting
   * with the administrator as the top-level object,
   * it reversely references citizen, general member, and customer information.
   */
  export interface IInvert extends IHubAdministrator {
    /**
     * Discriminator for the discriminated union type.
     */
    type: "administrator";

    /**
     * General Member Information.
     *
     * To register as an administrator member, you must first register
     * as a general member.
     */
    member: IHubMember.IInvert;

    /**
     * Customer information.
     *
     * This system manages customers by connection unit.
     *
     * That is, connection information for the current administrator member.
     */
    customer: IHubCustomer.IInvert;

    /**
     * Citizen authentication information.
     *
     * Administrators must complete citizen authentication.
     */
    citizen: IHubCitizen | null;
  }
}
