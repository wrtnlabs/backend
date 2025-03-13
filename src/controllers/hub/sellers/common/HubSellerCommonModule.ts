import { Module } from "@nestjs/common";

import { HubSellerCommonAttachmentController } from "./HubSellerCommonAttachmentController";

@Module({
  controllers: [HubSellerCommonAttachmentController],
})
export class HubSellerCommonModule {}
