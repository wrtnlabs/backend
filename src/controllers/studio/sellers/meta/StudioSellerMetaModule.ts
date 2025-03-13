import { Module } from "@nestjs/common";

import { StudioSellerMetaChatSessionConnectionController } from "./StudioSellerMetaChatSessionConnectionController";
import { StudioSellerMetaChatSessionController } from "./StudioSellerMetaChatSessionController";
import { StudioSellerMetaChatSessionMessageController } from "./StudioSellerMetaChatSessionMessageController";
import { StudioSellerMetaChatSessionShareController } from "./StudioSellerMetaChatSessionShareController";
import { StudioSellerMetaChatsessionShareMessageController } from "./StudioSellerMetaChatsessionShareMessageController";

@Module({
  controllers: [
    StudioSellerMetaChatSessionController,
    StudioSellerMetaChatSessionConnectionController,
    StudioSellerMetaChatSessionMessageController,
    StudioSellerMetaChatSessionShareController,
    StudioSellerMetaChatsessionShareMessageController,
  ],
})
export class StudioSellerMetaModule {}
