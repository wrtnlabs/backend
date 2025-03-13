import core from "@nestia/core";
import { AesPkcs5 } from "@nestia/fetcher/lib/AesPkcs5";
import { Controller, Post } from "@nestjs/common";
import { IPaymentHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentHistory";
import { IPaymentWebhookHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentWebhookHistory";
import typia, { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubDepositCharge } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDepositCharge";
import { IHubDepositChargePublish } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDepositChargePublish";

import { HubDepositChargeProvider } from "../../../../providers/hub/deposits/HubDepositChargeProvider";
import { HubDepositChargePublishProvider } from "../../../../providers/hub/deposits/HubDepositChargePublishProvider";

import { HubGlobal } from "../../../../HubGlobal";
import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";

@Controller("hub/customers/deposits/charges")
export class HubCustomerDepositChargeController {
  /**
   * Bulk query of deposit deposit history.
   *
   * Retrieves {@link IHubDepositCharge deposit deposit history} for
   * the current customer.
   *
   * The returned information is processed by {@link IPage paging}, and depending
   * on how the request information {@link IHubDepositCharge.IRequest} is set,
   * the number of records per page can be {@link IHubDepositCharge.IRequest.limit},
   * or {@link IHubDepositCharge.IRequest.search} only for deposit deposit/withdrawal
   * history that satisfies a specific condition, or
   * {@link IHubDepositCharge.IRequest.sort sort condition} of deposit
   * deposit/withdrawal history can be arbitrarily set.
   *
   * For reference, if you want to query all
   * {@link IHubDepositHistory deposit/withdrawal history}, call the
   * {@link osApi.functional.hub.customers.deposits.histories.index} function
   * instead.
   *
   * @param input page and search request information
   * @returns paginated list of deposit history
   * @author Samchon
   * @tag Deposit
   */
  @core.TypedRoute.Patch()
  public index(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubDepositCharge.IRequest,
  ): Promise<IPage<IHubDepositCharge>> {
    return HubDepositChargeProvider.index({
      customer,
      input,
    });
  }

  /**
   * Check deposit deposit history.
   *
   * Check deposit deposit history {@link IHubDepositCharge} individually.
   *
   * @param id {@link IHubDepositCharge.id} of target deposit history
   * @returns deposit history information
   * @author Samchon
   * @tag Deposit
   */
  @core.TypedRoute.Get(":id")
  public at(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<IHubDepositCharge> {
    return HubDepositChargeProvider.at({
      customer,
      id,
    });
  }

  /**
   * Apply for a deposit.
   *
   * @param input Deposit request input information
   * @returns Deposit details information
   * @author Samchon
   * @tag Deposit
   */
  @core.TypedRoute.Post()
  public create(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubDepositCharge.ICreate,
  ): Promise<IHubDepositCharge> {
    return HubDepositChargeProvider.create({
      customer,
      input,
    });
  }

  /**
   * Modify deposit application information.
   *
   * Modify {@link IHubDepositCharge.value amount} written when applying for deposit.
   *
   * @param id {@link IHubDepositCharge.id} of the deposit application details
   * @param input Deposit application details modification information
   * @author Samchon
   * @tag Deposit
   */
  @core.TypedRoute.Put(":id")
  public update(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubDepositCharge.IUpdate,
  ): Promise<void> {
    return HubDepositChargeProvider.update({
      customer,
      id,
      input,
    });
  }

  /**
   * Payment for deposit request (or completion).
   *
   * {@link IHubDepositChargePublish payment for {@link IHubDepositCharge deposit} requested by {@link IHubCustomer customer}
   *
   * However, in some cases, payment may not be completed even if this API is called.
   *
   * In the case of bank transfer or virtual account, if there is a difference between the payment and the {@link IHubDepositChargePublish.paid_at payment time} before the payment is completed,
   *
   * the deposit increase is not confirmed until the payment is completed.
   *
   * @param id {@link IHubDepositCharge.id} of the deposit request details
   * @param input Payment information acquired from the PG company
   * @returns Information on the deposit details for which payment has been completed
   * @author Samchon
   * @tag Deposit
   */
  @core.TypedRoute.Post(":id/publish")
  public publish(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubDepositChargePublish.ICreate,
  ): Promise<IHubDepositChargePublish> {
    return HubDepositChargePublishProvider.create({
      customer,
      charge: { id },
      input,
    });
  }

  /**
   * Refund.
   *
   * Process the refund for the deposit payment.
   *
   * If you deposited via a virtual account or bankbook, you must enter the refund account in
   * {@link IHubDepositChargePublish.IRefundStore.account}.
   *
   * @param id {@link IHubDepositCharge.id} of the deposit request details
   * @param input Refund request input information
   * @author Samchon
   * @tag Deposit
   *
   * @todo
   */
  @core.TypedRoute.Delete(":id/refund")
  public async refund(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubDepositChargePublish.IRefundStore,
  ): Promise<void> {
    customer;
    id;
    input;
    // return HubDepositChargePublishProvider.refund({
    //   customer,
    //   charge: { id },
    //   input,
    // });
  }

  /**
   * Gets the payment details stored in the payment system.
   *
   * API for pure test programs only.
   *
   * @param id {@link IHubDepositCharge.id} of the target application
   * @returns Payment details
   * @author SamChon
   * @tag Deposit
   *
   * @internal
   */
  @core.TypedRoute.Get(":id/payment")
  public payment(
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<IPaymentHistory> {
    return HubDepositChargePublishProvider.payment({ id });
  }

  /**
   *  @internal
   */
  @Post(":id/webhook")
  public async webhook(
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.PlainBody() input: string,
  ): Promise<void> {
    const history: IPaymentWebhookHistory =
      typia.json.assertParse<IPaymentWebhookHistory>(
        AesPkcs5.decrypt(
          input,
          HubGlobal.env.PAYMENT_CONNECTION_ENCRYPTION_KEY,
          HubGlobal.env.PAYMENT_CONNECTION_ENCRYPTION_IV,
        ),
      );
    await HubDepositChargePublishProvider.webhook({
      charge: { id },
      input: history,
    });
  }
}
