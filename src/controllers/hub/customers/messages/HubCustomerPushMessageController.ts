import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubPushMessageController } from "../../base/messages/HubPushMessageController";

export class HubCustomerPushMessageController extends HubPushMessageController({
  path: "customers",
  AuthGuard: HubCustomerAuth,
}) {}
