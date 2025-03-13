import { Module } from "@nestjs/common";

import { HubSellerSaleAuditCommentController } from "./HubSellerSaleAuditCommentController";
import { HubSellerSaleAuditController } from "./HubSellerSaleAuditController";
import { HubSellerSaleContentController } from "./HubSellerSaleContentController";
import { HubSellerSaleController } from "./HubSellerSaleController";
import { HubSellerSaleQuestionCommentController } from "./HubSellerSaleQuestionCommentController";
import { HubSellerSaleQuestionController } from "./HubSellerSaleQuestionController";
import { HubSellerSaleReviewCommentController } from "./HubSellerSaleReviewCommentController";
import { HubSellerSaleReviewController } from "./HubSellerSaleReviewController";
import { HubSellerSaleSnapshotContentController } from "./HubSellerSaleSnapshotContentController";
import { HubSellerSaleSnapshotController } from "./HubSellerSaleSnapshotController";
import { HubSellerSaleSnapshotUnitParameterController } from "./HubSellerSaleSnapshotUnitParameterController";

@Module({
  controllers: [
    HubSellerSaleAuditCommentController,
    HubSellerSaleAuditController,
    HubSellerSaleQuestionCommentController,
    HubSellerSaleQuestionController,
    HubSellerSaleReviewCommentController,
    HubSellerSaleReviewController,
    HubSellerSaleController,
    HubSellerSaleSnapshotController,
    HubSellerSaleSnapshotUnitParameterController,
    HubSellerSaleContentController,
    HubSellerSaleSnapshotContentController,
  ],
})
export class HubSellerSaleModule {}
