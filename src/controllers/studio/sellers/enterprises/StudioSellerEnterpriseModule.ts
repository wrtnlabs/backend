import { Module } from "@nestjs/common";

import { StudioSellerEnterpriseController } from "./StudioSellerEnterpriseController";
import { StudioSellerEnterpriseEmployeeController } from "./StudioSellerEnterpriseEmployeeController";
import { StudioSellerEnterpriseTeamCompanionController } from "./StudioSellerEnterpriseTeamCompanionController";
import { StudioSellerEnterpriseTeamController } from "./StudioSellerEnterpriseTeamController";

@Module({
  controllers: [
    StudioSellerEnterpriseEmployeeController,
    StudioSellerEnterpriseController,
    StudioSellerEnterpriseTeamCompanionController,
    StudioSellerEnterpriseTeamController,
  ],
})
export class StudioSellerEnterpriseModule {}
