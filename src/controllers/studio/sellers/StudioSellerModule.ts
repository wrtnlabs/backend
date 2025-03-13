import { Module } from "@nestjs/common";

import { StudioSellerAccountModule } from "./accounts/StudioSellerAccountModule";
import { StudioSellerEnterpriseModule } from "./enterprises/StudioSellerEnterpriseModule";
import { StudioSellerMetaModule } from "./meta/StudioSellerMetaModule";

@Module({
  imports: [
    StudioSellerAccountModule,
    StudioSellerEnterpriseModule,
    StudioSellerMetaModule,
  ],
})
export class StudioSellerModule {}
