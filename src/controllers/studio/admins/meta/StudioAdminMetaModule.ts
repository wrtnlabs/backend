import { Module } from "@nestjs/common";

import { StudioAdminMetaChatSessionConnectionController } from "./StudioAdminMetaChatSessionConnectionController";
import { StudioAdminMetaChatSessionController } from "./StudioAdminMetaChatSessionController";
import { StudioAdminMetaChatSessionMessageController } from "./StudioAdminMetaChatSessionMessageController";
import { StudioAdminMetaChatSessionShareController } from "./StudioAdminMetaChatSessionShareController";
import { StudioAdminMetaChatsessionShareMessageController } from "./StudioAdminMetaChatsessionShareMessageController";

@Module({
  controllers: [
    StudioAdminMetaChatSessionController,
    StudioAdminMetaChatSessionConnectionController,
    StudioAdminMetaChatSessionMessageController,
    StudioAdminMetaChatSessionShareController,
    StudioAdminMetaChatsessionShareMessageController,
  ],
})
export class StudioAdminMetaModule {}
