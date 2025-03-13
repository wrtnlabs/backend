import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { IHubCitizen } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCitizen";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

import { HubCustomerProvider } from "../../../../providers/hub/actors/HubCustomerProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";

@Controller("hub/customers/citizens")
export class HubCustomerCitizenController {
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
}
