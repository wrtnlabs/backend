import { Module } from "@nestjs/common";

import { HubCustomerAuthenticateController } from "./HubCustomerAuthenticateController";
import { HubCustomerAuthenticateKeyController } from "./HubCustomerAuthenticateKeyController";
import { HubCustomerAuthenticatePasswordController } from "./HubCustomerAuthenticatePasswordController";
import { HubCustomerOAuthenticateController } from "./HubCustomerOAuthenticateController";

@Module({
  controllers: [
    HubCustomerAuthenticateController,
    HubCustomerAuthenticatePasswordController,
    HubCustomerAuthenticateKeyController,
    HubCustomerOAuthenticateController,
  ],
})
export class HubCustomerAuthenticateModule {}
