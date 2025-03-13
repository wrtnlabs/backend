import { Module } from "@nestjs/common";

import { HubSellerSystematicChannelCategoryController } from "./HubSellerSystematicChannelCategoryController";
import { HubSellerSystematicChannelController } from "./HubSellerSystematicChannelController";
import { HubSellerSystematicSectionController } from "./HubSellerSystematicSectionController";

@Module({
  controllers: [
    HubSellerSystematicChannelCategoryController,
    HubSellerSystematicChannelController,
    HubSellerSystematicSectionController,
  ],
})
export class HubSellerSystematicModule {}
