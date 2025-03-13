import { Module } from "@nestjs/common";

import { HubCustomerOpenApiTranslateController } from "./HubCustomerOpenApiTranslateController";

@Module({
  controllers: [HubCustomerOpenApiTranslateController],
})
export class HubCustomerOpenApiModule {}
