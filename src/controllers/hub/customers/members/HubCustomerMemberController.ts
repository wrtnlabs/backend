import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";

import { HubMemberPasswordProvider } from "../../../../providers/hub/actors/HubMemberPasswordProvider";
import { HubMemberProvider } from "../../../../providers/hub/actors/HubMemberProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";

@Controller("hub/customers/members")
export class HubCustomerMemberController {
  /**
   * Sign up.
   *
   * Register the current {@link IHubCustomer customer} as a {@link IHubMember member}.
   * And if you also record {@link activate authentication information} when signing up,
   * then whenever the member {@link login logs in}, you can skip authentication.
   *
   * Also, if the {@link IHubCustomer citizen} in the past has
   * {@link IHubExternalUser external user} or {@link activate authentication}
   * {@link IHubOrder purchase} or {@link IBbsArticle posts} written, the
   * {@link IHubMember member} can also view or edit these through {@link login log in}.
   * In other words, you can also access the activity history before signing up.
   *
   * As a reference, as described in the {@link create} function, before calling
   * this function, you must first call the {@link create} function to issue a
   * {@link IHubCustomer customer} record and token.
   *
   * Before join, you must get email verification.
   *
   * @param input Membership registration input information
   * @returns Customer information after membership registration
   * @author Samchon
   * @tag Authenticate
   */
  @core.TypedRoute.Post("join")
  public join(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubMember.IJoin,
  ): Promise<IHubCustomer> {
    return HubMemberProvider.localJoin({
      customer,
      input,
    });
  }

  /**
   * Member Login.
   *
   * {@link IHubMember member} {@link IHubCustomer customer} logs in
   * by entering the account email and password.
   *
   * If the member has previously {@link activate self-verification},
   * {@link IHubCustomer.citizen} will be filled in accordingly. Also, if the member
   * has also registered as {@link IHubMember.administrator administrator} or
   * {@link IHubMember.seller seller}, the relevant information will also be filled
   * in accordingly.
   *
   * As a reference, as described in the {@link create} function, before calling
   * this function, you must first call the {@link create} function to issue the
   * {@link IHubCustomer customer} record and token.
   *
   * @param input Login input information
   * @returns Customer information after logging in
   * @author Samchon
   * @tag Authenticate
   */
  @core.TypedRoute.Patch("login")
  public login(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubMember.ILogin,
  ): Promise<IHubCustomer> {
    return HubMemberProvider.login({
      customer,
      input,
    });
  }

  /**
   * Change Password.
   *
   * Change the password of the member account.
   *
   * @param input Password change information
   * @author Samchon
   * @tag Authenticate
   */
  @core.TypedRoute.Put("password/change")
  public change(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubMember.IPasswordChange,
  ): Promise<void> {
    return HubMemberPasswordProvider.change({
      customer,
      input,
    });
  }

  /**
   * Update the member information.
   *
   * This method is used to update the member information.
   *
   *
   * @param input The information to update.
   * @returns The updated member information.
   * @author Asher
   * @tag Member
   */
  @core.TypedRoute.Put()
  public update(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubMember.IUpdate,
  ): Promise<IHubMember> {
    return HubMemberProvider.update({
      customer: customer,
      input: input,
    });
  }
}
