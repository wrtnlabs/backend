import { Module } from "@nestjs/common";

import { StudioCustomerEnterpriseController } from "./StudioCustomerEnterpriseController";
import { StudioCustomerEnterpriseEmployeeController } from "./StudioCustomerEnterpriseEmployeeController";
import { StudioCustomerEnterpriseTeamCompanionController } from "./StudioCustomerEnterpriseTeamCompanionController";
import { StudioCustomerEnterpriseTeamController } from "./StudioCustomerEnterpriseTeamController";

@Module({
  controllers: [
    StudioCustomerEnterpriseEmployeeController,
    StudioCustomerEnterpriseController,
    StudioCustomerEnterpriseTeamCompanionController,
    StudioCustomerEnterpriseTeamController,
  ],
})
export class StudioCustomerEnterpriseModule {}
