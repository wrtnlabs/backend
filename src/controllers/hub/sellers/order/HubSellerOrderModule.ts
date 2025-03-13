import { Module } from "@nestjs/common";

import { HubSellerOrderController } from "./HubSellerOrderController";
import { HubSellerOrderGoodController } from "./HubSellerOrderGoodController";
import { HubSellerOrderGoodIssueCommentController } from "./HubSellerOrderGoodIssueCommentController";
import { HubSellerOrderGoodIssueController } from "./HubSellerOrderGoodIssueController";
import { HubSellerOrderGoodIssueFeeController } from "./HubSellerOrderGoodIssueFeeController";
import { HubSellerOrderGoodSnapshotController } from "./HubSellerOrderGoodSnapshotController";

@Module({
  controllers: [
    HubSellerOrderGoodIssueCommentController,
    HubSellerOrderGoodIssueFeeController,
    HubSellerOrderGoodIssueController,
    HubSellerOrderGoodSnapshotController,
    HubSellerOrderGoodController,
    HubSellerOrderController,
  ],
})
export class HubSellerOrderModule {}
