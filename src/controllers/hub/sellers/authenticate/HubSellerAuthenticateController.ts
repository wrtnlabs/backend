import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";

import { HubSellerProvider } from "../../../../providers/hub/actors/HubSellerProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";

@Controller("hub/sellers/authenticate")
export class HubSellerAuthenticateController {
  /**
   * Seller Member Login.
   *
   * {@link IHubSeller Seller} {@link IHubCustomer Customer} who signed up
   * as a member logs in by entering the account's email and password.
   *
   * This API is basically the same as the customer-side login API,
   * {@link osApi.functional.hub.customers.members.login}, but it allows login
   * for simple {@link IHubMember members} who have not signed up as
   * {@link join seller members}, and this is not the case. In addition, the returned
   * type is also a structure that {@link IHubSeller.IInvert reverse reference} from
   * the seller to the member and customer information, while the customer-side
   * API references {@link IHubCustomer.member customer to member}, and
   * {@link IHubMember.seller member to seller} in the forward direction.
   *
   * Please note that before logging in as a seller, you must call the
   * {@link osApi.functional.hub.customers.authenticate.create} function to issue
   * a {@link IHubCustomer customer} record and token. This is because the system
   * cannot do anything without issuing a customer token.
   *
   * @param input Member login input information
   * @returns Sales information
   * @author Samchon
   * @tag Authenticate
   */
  @core.TypedRoute.Post("login")
  public login(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubMember.ILogin,
  ): Promise<IHubSeller.IInvert> {
    return HubSellerProvider.login({
      customer,
      input,
    });
  }

  /**
   * Sign up for seller membership.
   *
   * {@link IHubMember General Member} {@link IHubCustomer Customer},
   * sign up as {@link IHubSeller Seller Member}.
   *
   * Of course, in order to call this API function, you must issue a customer token
   * and complete registration as a general member. Therefore, the following two
   * APIs must have been called in order in advance.
   *
   * 1. {@link osApi.functional.hub.customers.authenticate.create}
   * 2. {@link osApi.functional.hub.customers.members.join}
   *
   * @param input Membership registration input information
   * @returns Seller information
   * @author Samchon
   * @tag Authenticate
   */
  @core.TypedRoute.Post("join")
  public join(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubSeller.IJoin,
  ): Promise<IHubSeller.IInvert> {
    return HubSellerProvider.join({
      customer,
      input,
    });
  }

  /**
   * Get seller information.
   *
   * {@link IHubSeller Seller} {@link IHubCustomer Customer} who signed up as a member,
   * re-queries his {@link IHubSeller.Invert Seller Reference Information}.
   *
   * @returns seller information
   * @author Samchon
   * @tag Authenticate
   */
  @core.TypedRoute.Get()
  public async get(
    @HubSellerAuth() seller: IHubSeller.IInvert,
  ): Promise<IHubSeller.IInvert> {
    return seller;
  }
}
