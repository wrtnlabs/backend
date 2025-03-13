import { Module } from "@nestjs/common";

import { HubCustomerCommonAttachmentController } from "./HubCustomerCommonAttachmentController";
import { HubCustomerCommonCheckPrivacyController } from "./HubCustomerCommonCheckPrivacyController";
import { HubCustomerCommonTranslateController } from "./HubCustomerCommonTranslateController";
import { UrlShortnerController } from "./UrlShortnerController";

@Module({
  controllers: [
    HubCustomerCommonAttachmentController,
    HubCustomerCommonCheckPrivacyController,
    HubCustomerCommonTranslateController,
    UrlShortnerController,
  ],
})
export class HubCustomerCommonModule {}
