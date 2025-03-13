import { Module } from "@nestjs/common";

import { StudioCustomerAccountController } from "./StudioCustomerAccountController";
import { StudioCustomerAccountLlmKeyController } from "./StudioCustomerAccountLlmKeyController";
import { StudioCustomerAccountSecretController } from "./StudioCustomerAccountSecretController";
import { StudioCustomerAccountSecretValueController } from "./StudioCustomerAccountSecretValueController";
import { StudioCustomerAccountSecretValueSandboxController } from "./StudioCustomerAccountSecretValueSandboxController";

@Module({
  controllers: [
    StudioCustomerAccountController,
    StudioCustomerAccountLlmKeyController,
    StudioCustomerAccountSecretController,
    StudioCustomerAccountSecretValueController,
    StudioCustomerAccountSecretValueSandboxController,
  ],
})
export class StudioCustomerAccountModule {}
