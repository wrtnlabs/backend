import { Module } from "@nestjs/common";

import { HubSellerAuthenticateController } from "./HubSellerAuthenticateController";

@Module({
  controllers: [HubSellerAuthenticateController],
})
export class HubSellerAuthenticateModule {}
