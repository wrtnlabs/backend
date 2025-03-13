import { Module } from "@nestjs/common";

import { HubAdminSystematicChannelCategoryController } from "./HubAdminSystematicChannelCategoryController";
import { HubAdminSystematicChannelController } from "./HubAdminSystematicChannelController";
import { HubAdminSystematicSectionController } from "./HubAdminSystematicSectionController";

@Module({
  controllers: [
    HubAdminSystematicChannelCategoryController,
    HubAdminSystematicChannelController,
    HubAdminSystematicSectionController,
  ],
})
export class HubAdminSystematicModule {}
