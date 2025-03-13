import { Module } from "@nestjs/common";

import { HubAdminOrderController } from "./HubAdminOrderController";
import { HubAdminOrderGoodController } from "./HubAdminOrderGoodController";
import { HubAdminOrderGoodIssueCommentController } from "./HubAdminOrderGoodIssueCommentController";
import { HubAdminOrderGoodIssueController } from "./HubAdminOrderGoodIssueController";
import { HubAdminOrderGoodSnapshotController } from "./HubAdminOrderGoodSnapshotController";

@Module({
  controllers: [
    HubAdminOrderGoodIssueCommentController,
    HubAdminOrderGoodIssueController,
    HubAdminOrderGoodSnapshotController,
    HubAdminOrderGoodController,
    HubAdminOrderController,
  ],
})
export class HubAdminOrderModule {}
