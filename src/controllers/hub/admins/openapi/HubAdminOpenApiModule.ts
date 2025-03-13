import { Module } from "@nestjs/common";

import { HubAdminOpenApiTranslateController } from "./HubAdminOpenApiTranslateController";

@Module({
  controllers: [HubAdminOpenApiTranslateController],
})
export class HubAdminOpenApiModule {}
