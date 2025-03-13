import { Module } from "@nestjs/common";

import { HubCustomerSaleContentController } from "./HubCustomerSaleContentController";
import { HubCustomerSaleController } from "./HubCustomerSaleController";
import { HubCustomerSaleQuestionCommentController } from "./HubCustomerSaleQuestionCommentController";
import { HubCustomerSaleQuestionController } from "./HubCustomerSaleQuestionController";
import { HubCustomerSaleReviewCommentController } from "./HubCustomerSaleReviewCommentController";
import { HubCustomerSaleReviewController } from "./HubCustomerSaleReviewController";
import { HubCustomerSaleSnapshotContentController } from "./HubCustomerSaleSnapshotContentController";
import { HubCustomerSaleSnapshotController } from "./HubCustomerSaleSnapshotController";
import { HubCustomerBookmarkSaleController } from "./bookmark/HubCustomerBookmarkSaleController";
import { HubCustomerSaleCollectionController } from "./collections/HubCustomerSaleCollectionController";
import { HubCustomerSaleInquiryLikeController } from "./likes/HubCustomerSaleInquiryLikeController";
import { HubCustomerSaleRecommendController } from "./recommend/HubCustomerSaleRecommendController";

@Module({
  controllers: [
    HubCustomerSaleQuestionCommentController,
    HubCustomerSaleQuestionController,
    HubCustomerSaleReviewCommentController,
    HubCustomerSaleReviewController,
    HubCustomerSaleController,
    HubCustomerSaleSnapshotController,
    HubCustomerBookmarkSaleController,
    HubCustomerSaleCollectionController,
    HubCustomerSaleRecommendController,
    HubCustomerSaleInquiryLikeController,
    HubCustomerSaleContentController,
    HubCustomerSaleSnapshotContentController,
  ],
})
export class HubCustomerSaleModule {}
