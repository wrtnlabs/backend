import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubPushMessageController } from "../../base/messages/HubPushMessageController";

export class HubSellerPushMessasgeController extends HubPushMessageController({
  path: "sellers",
  AuthGuard: HubSellerAuth,
}) {}
