import core from "@nestia/core";
import { tags } from "typia";

import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubSaleAudit } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAudit";
import { IHubSaleAuditApproval } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAuditApproval";
import { IHubSaleAuditRejection } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAuditRejection";

import { HubSaleAuditApprovalProvider } from "../../../../providers/hub/sales/audits/HubSaleAuditApprovalProvider";
import { HubSaleAuditProvider } from "../../../../providers/hub/sales/audits/HubSaleAuditProvider";
import { HubSaleAuditRejectionProvider } from "../../../../providers/hub/sales/audits/HubSaleAuditRejectionProvider";

import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubSaleAuditController } from "../../base/sales/HubSaleAuditController";

export class HubAdminSaleAuditController extends HubSaleAuditController({
  path: "admins",
  AuthGuard: HubAdminAuth,
}) {
  /**
   * Initiate an audit.
   *
   * {@link IHubAdministrator administrator} creates an {@link IHubSaleAudit audit post},
   * and notifies the {@link IHubSeller selling party} of the {@link IHubSale listing}
   * of the audit initiation and commencement.
   *
   * The administrator writes the audit post, describes how the audit will proceed,
   * and can supplement the content of the audit initiation post by adding
   * {@link IHubSaleAuditSnapshot.files attachments}, etc. In addition, the
   * administrator and the seller can communicate with each other by writing
   * {@link IHubSaleAuditComment comments} on this post.
   *
   * @param saleId {@link IHubSale.id} of the listing
   * @param input audit input information
   * @returns audit information
   * @author Samchon
   * @tag Sale
   */
  @core.TypedRoute.Post()
  public create(
    @HubAdminAuth() admin: IHubAdministrator.IInvert,
    @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubSaleAudit.ICreate,
  ): Promise<IHubSaleAudit> {
    return HubSaleAuditProvider.create({
      admin,
      sale: { id: saleId },
      input,
    });
  }

  /**
   * Editing an audit post.
   *
   * Edit the {@link IHubAdminSaleAudit audit post} written by
   * {@link IHubAdministrator} yourself.
   *
   * Note that the administrator who wrote the audit post and the administrator
   * who {@link approved} or {@link rejected} can be different, but only the
   * initiating administrator can edit it. If an administrator wants to say
   * something different from what the initiating administrator wrote in the post,
   * they should write a {@link IHubSaleAuditComment comment} instead.
   *
   * In addition, as is the policy that this hub system applies to posts in general,
   * even if an administrator edits a {@link IHubSaleAudit audit post}, the original
   * content does not actually change. The edited content is accumulated and recorded
   * in the existing post record as a new {@link IHubSaleAudit.ISnapshot snapshot}.
   * And this is disclosed to everyone, including {@link IHubSeller seller} and
   * {@link IHubAdministrator administrator}, and anyone who can view the post
   * can also view the revision history.
   *
   * This is to prevent administrators or sellers from manipulating the situation
   * by editing their own posts, as e-commerce is a highly dispute-prone industry.
   * In other words, it is for the purpose of preserving evidence.
   *
   * @param saleId {@link IHubSale.id} of the listing to which it belongs
   * @param id {@link IHubSaleAudit.id} of the audit target
   * @param input audit revision information
   * @returns audit information snapshot
   * @author Samchon
   * @tag Sale
   */
  @core.TypedRoute.Put(":id")
  public update(
    @HubAdminAuth() admin: IHubAdministrator.IInvert,
    @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubSaleAudit.IUpdate,
  ): Promise<IHubSaleAudit.ISnapshot> {
    return HubSaleAuditProvider.update({
      admin,
      sale: { id: saleId },
      id,
      input,
    });
  }

  /**
   * Approve the review.
   *
   * {@link IHubAdministrator administrator} approves the current
   * {@link IHubSaleAudit review}, and allows the sale of the {@link IHubSale listing}.
   *
   * Note that the administrator who approved the review and the administrator
   * who wrote the review initiation post may be different.
   *
   * Also, it is possible to {@link reject} the review and then approve it again
   * (when {@link IHubSaleAuditRejection.reversible} is `true`), and in this case,
   * the administrator who rejected the review and the administrator who approved
   * it may be different.
   *
   * @param saleId {@link IHubSale.id} of the listing to which it belongs
   * @param id {@link IHubSaleAudit.id} of the target review
   * @param input Input information for review approval
   * @returns Information for review approval
   * @author Samchon
   * @tag Sale
   */
  @core.TypedRoute.Post(":id/approve")
  public approve(
    @HubAdminAuth() admin: IHubAdministrator.IInvert,
    @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubSaleAuditApproval.ICreate,
  ): Promise<IHubSaleAuditApproval> {
    return HubSaleAuditApprovalProvider.create({
      admin,
      sale: { id: saleId },
      audit: { id },
      input,
    });
  }

  /**
   * Reject the review.
   *
   * {@link IHubAdministrator administrator} rejects the current
   * {@link IHubSaleAudit review} and disallows the sale of the
   * {@link IHubSale listing}.
   *
   * However, the review rejection can be reversed and {@link approve} in some cases.
   * This is the case when the {@link IHubSaleAuditRejection.reversible} value among
   * the information entered by the administrator is `true`.
   *
   * In this case, the seller can {@link emend edit} and resubmit the listing
   * according to the administrator's instructions. Also, if the seller wants to
   * raise an objection to the review rejection, the seller can write a
   * {@link IHubSaleAuditComment comment} on the current review post and ask the
   * administrator to reverse the rejection and {@link approve}.
   *
   * The administrator can accept the seller's approval request and actually allow
   * the sale of the item. However, on the other hand, it is impossible to change
   * an already approved review to a rejection, so please keep this in mind.
   *
   * @param saleId {@link IHubSale.id} of the item to which it belongs
   *
   * @param id {@link IHubSaleAudit.id} of the target review
   *
   * @param input Input information for the review rejection
   * @returns Information for the review rejection
   * @author Samchon
   * @tag Sale
   */
  @core.TypedRoute.Post(":id/reject")
  public reject(
    @HubAdminAuth() admin: IHubAdministrator.IInvert,
    @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubSaleAuditRejection.ICreate,
  ): Promise<IHubSaleAuditRejection> {
    return HubSaleAuditRejectionProvider.create({
      admin,
      sale: { id: saleId },
      audit: { id },
      input,
    });
  }
}
