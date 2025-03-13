import { HubOrderPublishErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderPublishErrorCode";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IHubOrderPublish } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderPublish";

export namespace HubOrderPublishDiagnoser {
  export const validate = (input: IHubOrderPublish.ICreate): IDiagnosis[] => {
    const result: IDiagnosis[] = [];
    if (input.opened_at !== null && input.opened_at !== "now") {
      // 미래 시점이어야하되, 약간의 오차 허용
      if (new Date(input.opened_at).getTime() < Date.now() - 15_000)
        result.push({
          accessor: "input.opened_at",
          code: HubOrderPublishErrorCode.OPENING_TIME_IS_EARLIER_THAN_NOW,
          message: "opened_at must be in the future.",
        });
    }

    if (input.closed_at !== null) {
      // 무조건 미래 시점이어야 함
      if (new Date(input.closed_at).getTime() < Date.now())
        result.push({
          accessor: "input.closed_at",
          code: HubOrderPublishErrorCode.CLOSING_TIME_IS_EARLIER_THAN_NOW,
          message: "closed_at must be in the future.",
        });
    }

    if (input.opened_at !== null && input.closed_at !== null) {
      const x: number =
        input.opened_at === "now"
          ? new Date().getTime()
          : new Date(input.opened_at).getTime();
      const y: number = new Date(input.closed_at).getTime();

      // @todo - 개시 시점이 종료 시점보다 한 달 이상 앞서야 하는 것으로
      if (x > y)
        result.push({
          accessor: "input.closed_at",
          code: HubOrderPublishErrorCode.CLOSING_TIME_IS_EARLIER_THAN_OPENING_TIME,
          message: "closed_at must be greater than input.opened_at.",
        });
    }

    if (input.closed_at !== null && input.opened_at === null)
      result.push({
        accessor: "input.closed_at",
        code: HubOrderPublishErrorCode.CLOSING_TIME_WITHOUT_OPENING_TIME,
        message: "unable to configure closed_at without opened_at.",
      });

    return result;
  };
}
