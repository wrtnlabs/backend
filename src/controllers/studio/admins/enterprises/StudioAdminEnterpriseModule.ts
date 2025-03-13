import { Module } from "@nestjs/common";

import { StudioAdminEnterpriseController } from "./StudioAdminEnterpriseController";
import { StudioAdminEnterpriseEmployeeController } from "./StudioAdminEnterpriseEmployeeController";
import { StudioAdminEnterpriseTeamCompanionController } from "./StudioAdminEnterpriseTeamCompanionController";
import { StudioAdminEnterpriseTeamController } from "./StudioAdminEnterpriseTeamController";

@Module({
  controllers: [
    StudioAdminEnterpriseEmployeeController,
    StudioAdminEnterpriseController,
    StudioAdminEnterpriseTeamCompanionController,
    StudioAdminEnterpriseTeamController,
  ],
})
export class StudioAdminEnterpriseModule {}
