import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubExternalUser } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubExternalUser";

import { HubExternalUserProvider } from "../../../../providers/hub/actors/HubExternalUserProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";

@Controller("hub/customers/externals")
export class HubCustomerExternalController {
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
