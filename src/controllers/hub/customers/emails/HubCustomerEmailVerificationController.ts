import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

import { HubCustomerEmailVerificationProvider } from "../../../../providers/hub/actors/HubCustomerEmailVerificationProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";

@Controller("hub/customers/emails/verifications")
export class HubCustomerEmailVerificationController {
  /**
   * Send Verification Email.
   *
   * Send verification email to sign up or etc.
   * From email verification to subsequent work, all must be done in one session.
   *
   * @param input
   * @tags Email
   * @author Michael
   */
  @core.TypedRoute.Post("send")
  public send(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubCustomer.IEmail,
  ): Promise<void> {
    return HubCustomerEmailVerificationProvider.send({
      customer,
      input,
    });
  }

  /**
   * Verify Email.
   *
   * Verify Email address using verification code.
   * From email verification to subsequent work, all must be done in one session.
   *
   * @param input
   * @tags Email
   * @author Michael
   */
  @core.TypedRoute.Patch()
  public verify(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubCustomer.IVerifyEmail,
  ): Promise<void> {
    return HubCustomerEmailVerificationProvider.verify({
      customer,
      input,
    });
  }
}
