import { CommonErrorCode } from "./common/CommonErrorCode";
import { HubActorErrorCode } from "./hub/HubActorErrorCode";
import { HubCartCommodityErrorCode } from "./hub/HubCartCommodityErrorCode";
import { HubCouponErrorCode } from "./hub/HubCouponErrorCode";
import { HubDepositErrorCode } from "./hub/HubDepositErrorCode";
import { HubOrderErrorCode } from "./hub/HubOrderErrorCode";
import { HubOrderGoodErrorCode } from "./hub/HubOrderGoodErrorCode";
import { HubOrderGoodIssueErrorCode } from "./hub/HubOrderGoodIssueErrorCode";
import { HubOrderPublishErrorCode } from "./hub/HubOrderPublishErrorCode";
import { HubSaleAuditErrorCode } from "./hub/HubSaleAuditErrorCode";
import { HubSaleErrorCode } from "./hub/HubSaleErrorCode";
import { HubSaleInquiryErrorCode } from "./hub/HubSaleInquiryErrorCode";
import { HubSystematicErrorCode } from "./hub/HubSystematicErrorCode";
import { StudioAccountErrorCode } from "./studio/StudioAccountErrorCode";
import { StudioEnterpriseEmployeeErrorCode } from "./studio/StudioEnterpriseEmployeeErrorCode";
import { StudioEnterpriseTeamErrorCode } from "./studio/StudioEnterpriseTeamErrorCode";

export type ErrorCode =
  | CommonErrorCode
  | HubActorErrorCode
  | HubCartCommodityErrorCode
  | HubCouponErrorCode
  | HubDepositErrorCode
  | HubOrderErrorCode
  | HubOrderGoodErrorCode
  | HubOrderGoodIssueErrorCode
  | HubOrderPublishErrorCode
  | HubSaleAuditErrorCode
  | HubSaleErrorCode
  | HubSaleInquiryErrorCode
  | HubSystematicErrorCode
  | StudioAccountErrorCode
  | StudioEnterpriseEmployeeErrorCode
  | StudioEnterpriseTeamErrorCode;
