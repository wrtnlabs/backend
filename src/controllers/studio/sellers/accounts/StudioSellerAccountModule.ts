import { Module } from "@nestjs/common";

import { StudioSellerAccountController } from "./StudioSellerAccountController";
import { StudioSellerAccountLlmKeyController } from "./StudioSellerAccountLlmKeyController";
import { StudioSellerAccountSecretController } from "./StudioSellerAccountSecretController";
import { StudioSellerAccountSecretValueController } from "./StudioSellerAccountSecretValueController";

@Module({
  controllers: [
    StudioSellerAccountController,
    StudioSellerAccountLlmKeyController,
    StudioSellerAccountSecretController,
    StudioSellerAccountSecretValueController,
  ],
})
export class StudioSellerAccountModule {}
