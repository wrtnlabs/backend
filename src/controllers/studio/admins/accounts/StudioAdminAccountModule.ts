import { Module } from "@nestjs/common";

import { StudioAdminAccountController } from "./StudioAdminAccountController";
import { StudioAdminAccountLlmKeyController } from "./StudioAdminAccountLlmKeyController";
import { StudioAdminAccountSecretController } from "./StudioAdminAccountSecretController";
import { StudioAdminAccountSecretValueController } from "./StudioAdminAccountSecretValueController";

@Module({
  controllers: [
    StudioAdminAccountController,
    StudioAdminAccountLlmKeyController,
    StudioAdminAccountSecretController,
    StudioAdminAccountSecretValueController,
  ],
})
export class StudioAdminAccountModule {}
