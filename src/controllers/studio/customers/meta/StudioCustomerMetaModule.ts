import { Module } from "@nestjs/common";

import { StudioCustomerMetaChatSessionConnectionController } from "./StudioCustomerMetaChatSessionConnectionController";
import { StudioCustomerMetaChatSessionController } from "./StudioCustomerMetaChatSessionController";
import { StudioCustomerMetaChatSessionMessageController } from "./StudioCustomerMetaChatSessionMessageController";
import { StudioCustomerMetaChatSessionShareController } from "./StudioCustomerMetaChatSessionShareController";
import { StudioCustomerMetaChatSessionShareMessageController } from "./StudioCustomerMetaChatSessionShareMessageController";

@Module({
  controllers: [
    StudioCustomerMetaChatSessionController,
    StudioCustomerMetaChatSessionConnectionController,
    StudioCustomerMetaChatSessionMessageController,
    StudioCustomerMetaChatSessionShareController,
    StudioCustomerMetaChatSessionShareMessageController,
  ],
})
export class StudioCustomerMetaModule {}
