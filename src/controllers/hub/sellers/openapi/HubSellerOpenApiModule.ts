import { Module } from "@nestjs/common";

import { HubSellerOpenApiTranslateController } from "./HubSellerOpenApiTranslateController";

@Module({
  controllers: [HubSellerOpenApiTranslateController],
})
export class HubSellerOpenApiModule {}
