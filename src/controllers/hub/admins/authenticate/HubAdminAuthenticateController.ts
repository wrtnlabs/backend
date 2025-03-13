import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";

import { HubAdministratorProvider } from "../../../../providers/hub/actors/HubAdministratorProvider";

import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";

@Controller("hub/admins/authenticate")
export class HubAdminAuthenticateController {
  /**
   * Get admin info.
   *
   * {@link IHubAdministrator Admin} {@link IHubCustomer customer} who signed up
   * as a member, re-queries his
   * {@link IHubAdministrator.Invert Admin Base Reverse Reference Info}.
   *
   * @returns admin info
   * @author Samchon
   * @tag Authenticate
   */
  @core.TypedRoute.Get()
  public async get(
    @HubAdminAuth() admin: IHubAdministrator.IInvert,
  ): Promise<IHubAdministrator.IInvert> {
    return admin;
  }

  /**
   * Admin member login.
   *
   * {@link IHubAdministrator administrator} {@link IHubCustomer customer},
   * enters the account email and password to log in.
   *
   * This API is basically the same as the customer-side login API,
   * {@link osApi.functional.hub.customers.members.login}, but it allows login
   * for simple {@link IHubMember members} who have not registered as
   * {@link join administrator members}, and this is not the case. In addition,
   * the returned type is also a structure that
   * {@link IHubAdministrator.IInvert reverse reference} from the administrator to
   * member and customer information, while the customer-side API is a structure that
   * forward references {@link IHubCustomer.member customer to member}, and
   * {@link IHubMember.seller member to administrator}.
   *
   * Note that before logging in as an administrator, you must call the
   * {@link osApi.functional.hub.customers.authenticate.create} function to issue a
   * {@link IHubCustomer customer} record and token. This is because the system
   * cannot do anything without issuing a customer token.
   *
   * @param input Member login input information
   * @returns Sales information
   * @author Samchon
   * @tag Authenticate
   */
  @core.TypedRoute.Patch("login")
  public login(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubMember.ILogin,
  ): Promise<IHubAdministrator.IInvert> {
    return HubAdministratorProvider.login({
      customer,
      input,
    });
  }
}
