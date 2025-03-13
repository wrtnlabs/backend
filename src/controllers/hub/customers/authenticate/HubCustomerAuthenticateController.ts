import core from "@nestia/core";
import { Controller, Request } from "@nestjs/common";
import { FastifyRequest } from "fastify";

import { IHubCitizen } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCitizen";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubExternalUser } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubExternalUser";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";

import { HubCustomerProvider } from "../../../../providers/hub/actors/HubCustomerProvider";
import { HubExternalUserProvider } from "../../../../providers/hub/actors/HubExternalUserProvider";
import { HubMemberProvider } from "../../../../providers/hub/actors/HubMemberProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";

@Controller("hub/customers/authenticate")
export class HubCustomerAuthenticateController {
  /**
   * Renew token.
   *
   * Renew by issuing a new customer authentication token and reloading
   * customer information.
   *
   * Note that if this API function is called with SDK,
   * {@link IHubCustomer.IAuthorized.setHeaders.Authorization customer authentication token}
   * is automatically assigned to the {@link IConnection.headers} object used
   * at this time.
   *
   * @param input Renew token value
   * @returns Customer information + authentication token
   * @assignHeaders setHeaders
   * @author Samchon
   * @tag Authenticate
   */
  @core.TypedRoute.Patch("refresh")
  public refresh(
    @core.TypedBody() input: IHubCustomer.IRefresh,
  ): Promise<IHubCustomer.IAuthorized> {
    return HubCustomerProvider.refresh(input.value);
  }

  /**
   * Retrieve customer information.
   *
   * Retrieve current customer information.
   *
   * @returns customer information
   * @tag Authenticate
   */
  @core.TypedRoute.Get()
  public async get(
    @HubCustomerAuth() customer: IHubCustomer,
  ): Promise<IHubCustomer> {
    return customer;
  }

  /**
   * Issue customer records.
   *
   * ----------------
   *
   * This hub system considers all participants in this market as "customers".
   * And customer records are not identified based on individual
   * {@link IHubCitizen people}, but rather on the basis of connection units.
   * Therefore, even if they are the same person, a new `IHubCustomer` record is
   * issued for each connection.
   *
   * Therefore, all client applications accessing this service must first call
   * this function to report the inflow path of the {@link IHubCustomer customer}
   * to the server and issue an authentication token. If this function call is omitted,
   * all functions other than this API cannot be used.
   *
   * Even if you try to {@link activate self-authentication} or have already
   * {@link join membership} and try to {@link login log in} with
   * {@link IHubMember member account}, there is no exception. Before
   * self-authentication or login, you must call this function `create` first.
   * This is also the case when {@link IHubSeller Seller} or
   * {@link IHubAdministrator Administrator} logs in.
   *
   * ----------------
   *
   * Also, the authentication token issued at this time has an expiration time,
   * so it cannot be used permanently. Please note that the authentication token is
   * valid for 3 hours, and if you want to maintain customer authentication after
   * 3 hours, you must call the {@link refresh} function.
   *
   * In addition, if this API function is called with SDK,
   * {@link IHubCustomer.IAuthorized.setHeaders.Authorization Customer Authentication Token}
   * is automatically assigned to the {@link IConnection.headers} object.
   *
   * @param input Basic information for identifying the customer's inflow path
   * @returns New customer information and authentication token
   * @assignHeaders setHeaders
   * @author Samchon
   * @tag Authenticate
   */
  @core.TypedRoute.Post()
  public create(
    @Request() request: FastifyRequest,
    @core.TypedBody() input: IHubCustomer.ICreate,
  ): Promise<IHubCustomer.IAuthorized> {
    return HubCustomerProvider.create({
      request,
      input,
    });
  }

  /**
   * Modify customer information.
   *
   * Modify the customer's language code.
   * Modify an existing record without creating a new record.
   *
   * @param input Modify customer information input information
   * @return Modified customer information
   * @author Asher
   * @tag Authenticate
   */
  @core.TypedRoute.Put()
  public update(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubCustomer.IUpdate,
  ): Promise<IHubCustomer> {
    return HubCustomerProvider.update({
      customer,
      input,
    });
  }

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
   * If you want to signup with oauth, you must set the password to null.
   *
   * @param input Membership registration input information
   * @returns Customer information after membership registration
   * @author Samchon
   * @tag Authenticate
   * @deprecated
   */
  @core.TypedRoute.Post("join")
  public join(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubMember.IJoin,
  ): Promise<IHubCustomer> {
    return HubMemberProvider.join({
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
   * @deprecated
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
   * Authenticate citizens (yourself).
   *
   * An API that allows {@link IHubCustomer customers} to verify their identity
   * by entering their {@link IHubCitizen.mobile mobile phone number} and
   * {@link IHubCitizen.name real name (or nickname equivalent)}.
   *
   * If the customer has already {@link join membership} or
   * {@link external external user information}, they can immediately obtain
   * {@link IHubCitizen citizen} information and skip the authentication process by
   * logging in or re-entering the same external user information.
   *
   * As a reference, as described in the {@link create} function, before calling
   * this function, you must first call the {@link create} function to issue a
   * {@link IHubCustomer customer} record and token.
   *
   * @param input Citizen authentication input information
   * @returns Customer information after citizen authentication
   * @author Samchon
   * @tag Authenticate
   * @deprecated
   */
  @core.TypedRoute.Put("activate")
  public activate(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubCitizen.ICreate,
  ): Promise<IHubCustomer> {
    return HubCustomerProvider.activate({
      customer,
      input,
    });
  }

  /**
   *  Enroll external user info.
   *
   *  {@link IHubCustomer Customer} enrolls his/her
   *  {@link IHubExternalUser external user} information from other service.
   *
   *  It has similar effect with the {@link join membership joining} function,
   *  so that if you've performed the {@link IHubCitizen citizenship}
   *  {@link activate activation} too, then you can skip the {@link activate}
   *  function calling everytime you call this `external` function with same
   *  info from now on. Also, if the person had
   *  {@link IHubOrder purchased} with {@link activate} and {@link join}
   *  function calling, you can also access to the order history too. In other
   *  words, activity details prior to external server registration can also be
   *  accessed with continuity.
   *
   *  For reference, as described in the {@link create} function, before calling
   *  this `external` function, you must first create a customer record and token
   *  by calling the {@link create} function.
   *
   *  @param input Enroll information of the external user
   *  @returns External user enrolled customer information
   *  @tag Authenticate
   *
   *  @todo Must be shifted to the HubCustomerProvider
   *  @author Samchon
   *  @deprecated
   */
  @core.TypedRoute.Post("external")
  public async external(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubExternalUser.ICreate,
  ): Promise<IHubCustomer> {
    const external_user: IHubExternalUser =
      await HubExternalUserProvider.emplace({
        customer,
        channel: customer.channel,
        input,
      });
    return {
      ...customer,
      citizen: customer.citizen ?? external_user.citizen,
      external_user,
    };
  }
}
