import { Module } from "@nestjs/common";

import { HubCustomerCartCommodityController } from "./HubCustomerCartCommodityController";
import { HubCustomerOrderController } from "./HubCustomerOrderController";
import { HubCustomerOrderGoodController } from "./HubCustomerOrderGoodController";
import { HubCustomerOrderGoodHistoryController } from "./HubCustomerOrderGoodHistoryController";
import { HubCustomerOrderGoodIssueCommentController } from "./HubCustomerOrderGoodIssueCommentController";
import { HubCustomerOrderGoodIssueController } from "./HubCustomerOrderGoodIssueController";
import { HubCustomerOrderGoodIssueFeeController } from "./HubCustomerOrderGoodIssueFeeController";
import { HubCustomerOrderGoodSaleController } from "./HubCustomerOrderGoodSaleController";
import { HubCustomerOrderGoodSnapshotController } from "./HubCustomerOrderGoodSnapshotController";
import { HubCustomerOrderPublishController } from "./HubCustomerOrderPublishController";

@Module({
  controllers: [
    HubCustomerCartCommodityController,
    HubCustomerOrderGoodIssueCommentController,
    HubCustomerOrderGoodIssueFeeController,
    HubCustomerOrderGoodIssueController,
    HubCustomerOrderGoodSnapshotController,
    HubCustomerOrderGoodSaleController,
    HubCustomerOrderGoodController,
    HubCustomerOrderController,
    HubCustomerOrderPublishController,
    HubCustomerOrderGoodHistoryController,
  ],
})
export class HunCustomerOrderModule {}
