import { Module } from "@nestjs/common";

import { HubCustomerSystematicChannelCategoryController } from "./HubCustomerSystematicChannelCategoryController";
import { HubCustomerSystematicChannelController } from "./HubCustomerSystematicChannelController";
import { HubCustomerSystematicSectionController } from "./HubCustomerSystematicSectionController";

@Module({
  controllers: [
    HubCustomerSystematicChannelCategoryController,
    HubCustomerSystematicChannelController,
    HubCustomerSystematicSectionController,
  ],
})
export class HubCustomerSystematicModule {}
