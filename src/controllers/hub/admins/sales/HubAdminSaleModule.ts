import { Module } from "@nestjs/common";

import { HubAdminSaleAuditCommentController } from "./HubAdminSaleAuditCommentController";
import { HubAdminSaleAuditController } from "./HubAdminSaleAuditController";
import { HubAdminSaleContentController } from "./HubAdminSaleContentController";
import { HubAdminSaleController } from "./HubAdminSaleController";
import { HubAdminSaleQuestionCommentController } from "./HubAdminSaleQuestionCommentController";
import { HubAdminSaleQuestionController } from "./HubAdminSaleQuestionController";
import { HubAdminSaleReviewCommentController } from "./HubAdminSaleReviewCommentController";
import { HubAdminSaleReviewController } from "./HubAdminSaleReviewController";
import { HubAdminSaleSnapshotAuditController } from "./HubAdminSaleSnapshotAuditController";
import { HubAdminSaleSnapshotContentController } from "./HubAdminSaleSnapshotContentController";
import { HubAdminSaleSnapshotController } from "./HubAdminSaleSnapshotController";
import { HubAdminSaleCollectionController } from "./collections/HubAdminSaleCollectionController";

@Module({
  controllers: [
    HubAdminSaleAuditCommentController,
    HubAdminSaleAuditController,
    HubAdminSaleQuestionCommentController,
    HubAdminSaleQuestionController,
    HubAdminSaleReviewCommentController,
    HubAdminSaleReviewController,
    HubAdminSaleController,
    HubAdminSaleSnapshotController,
    HubAdminSaleSnapshotAuditController,
    HubAdminSaleCollectionController,
    HubAdminSaleContentController,
    HubAdminSaleSnapshotContentController,
  ],
})
export class HubAdminSaleModule {}
