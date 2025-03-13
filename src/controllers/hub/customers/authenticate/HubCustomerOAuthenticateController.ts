import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubExternalUser } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubExternalUser";

import { HubOAuthProvider } from "../../../../providers/hub/actors/HubOAuthProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";

@Controller("hub/customers/authenticate/oauth")
export class HubCustomerOAuthenticateController {
  /**
   * OAuth Login.
   *
   * Register the current {@link IHubCustomer customer} as {@link IHubExternalUser external user}.
   * And if Member exists, return {@link IHubCustomer customer} with {@link IHubMember member}.
   *
   * @param application oauth provider.
   * @param input information for oauth sign in.
   * @returns Hub Customer with Member if member exists.
   * @author michael
   * @tag OAuth
   */
  @core.TypedRoute.Patch(":application/login")
  public login(
    @core.TypedParam("application")
    application: IHubExternalUser.IApplicationParam,
    @core.TypedBody() input: IHubExternalUser.IOAuthLoginInput,
    @HubCustomerAuth() customer: IHubCustomer,
  ): Promise<IHubCustomer.IOAuthLogin> {
    return HubOAuthProvider.login(application)({ input, customer });
  }

  /**
   * Get OAuth authentication url.
   *
   * If you put the scope for access permissions, you can get authentication url has access permissions with redirect url.
   *
   * @param application oauth provider.
   * @param input scope and redirect url information.
   * @returns OAuth authentication url.
   * @author michael
   * @tag OAuth
   */
  @core.TypedRoute.Patch(":application/auth-url")
  public getAuthUrl(
    @core.TypedParam("application")
    application: IHubExternalUser.IApplicationParam,
    @core.TypedBody() input: IHubExternalUser.IGetAuthUrlInput,
  ): Promise<IHubExternalUser.IGetAuthUrlOutput> {
    return HubOAuthProvider.getAuthUrl(application)(input);
  }
}
