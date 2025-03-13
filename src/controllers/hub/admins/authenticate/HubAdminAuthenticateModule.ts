import { Module } from "@nestjs/common";

import { HubAdminAuthenticateController } from "./HubAdminAuthenticateController";

@Module({
  controllers: [HubAdminAuthenticateController],
})
export class HubAdminAuthenticateModule {}
