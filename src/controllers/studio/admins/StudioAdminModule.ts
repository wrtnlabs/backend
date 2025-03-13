import { Module } from "@nestjs/common";

import { StudioAdminAccountModule } from "./accounts/StudioAdminAccountModule";
import { StudioAdminEnterpriseModule } from "./enterprises/StudioAdminEnterpriseModule";
import { StudioAdminMetaModule } from "./meta/StudioAdminMetaModule";

@Module({
  imports: [
    StudioAdminAccountModule,
    StudioAdminEnterpriseModule,
    StudioAdminMetaModule,
  ],
})
export class StudioAdminModule {}
