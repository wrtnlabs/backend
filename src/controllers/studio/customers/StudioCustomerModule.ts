import { Module } from "@nestjs/common";

import { StudioCustomerAccountModule } from "./accounts/StudioCustomerAccountModule";
import { StudioCustomerEnterpriseModule } from "./enterprises/StudioCustomerEnterpriseModule";
import { StudioCustomerMetaModule } from "./meta/StudioCustomerMetaModule";

@Module({
  imports: [
    StudioCustomerAccountModule,
    StudioCustomerEnterpriseModule,
    StudioCustomerMetaModule,
  ],
})
export class StudioCustomerModule {}
