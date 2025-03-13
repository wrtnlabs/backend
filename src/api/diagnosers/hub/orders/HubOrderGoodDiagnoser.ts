import { HubOrderGoodErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderGoodErrorCode";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";

export namespace HubOrderGoodDiagnoser {
  export const validate_open =
    (current: Pick<IHubOrderGood, "opened_at" | "closed_at">) =>
    (input: IHubOrderGood.IOpen): IDiagnosis[] =>
      _Validate_open({
        current: (field) => `current.${field}`,
        entity: "Good",
      })(current)(input);

  export const validate_close =
    (current: Pick<IHubOrderGood, "opened_at" | "closed_at">) =>
    (input: IHubOrderGood.IClose): IDiagnosis[] =>
      _Validate_close({
        current: (field) => `current.${field}`,
        entity: "Good",
      })(current)(input);

  /**
   * @internal
   */
  export const _Validate_open =
    (props: { current: (field: string) => string; entity: string }) =>
    (current: Pick<IHubOrderGood, "opened_at" | "closed_at">) =>
    (input: IHubOrderGood.IOpen): IDiagnosis[] => {
      const result: IDiagnosis[] = [];

      // ALREADY OPENED
      if (
        current.opened_at !== null &&
        new Date(current.opened_at).getTime() < Date.now()
      )
        result.push({
          accessor: `${props.current}.opened_at`,
          code: HubOrderGoodErrorCode.OPENED,
          message: `${props.entity} has already been opened.`,
        });
      if (
        current.closed_at !== null &&
        new Date(current.closed_at).getTime() < Date.now()
      )
        result.push({
          accessor: `${props.current}.closed_at`,
          code: HubOrderGoodErrorCode.CLOSED,
          message: `${props.entity} has already been closed.`,
        });

      // TRY TO OPEN IN THE PAST
      if (
        input.opened_at !== null &&
        input.opened_at !== "now" &&
        new Date(input.opened_at).getTime() < Date.now() - 15_000
      )
        result.push({
          accessor: "input.opened_at",
          code: HubOrderGoodErrorCode.OPENING_TIME_IS_EARLIER_THAN_NOW,
          message: `${props.entity} cannot be opened in the past.`,
        });

      // TRY TO OPEN AFTER CLOSING
      if (
        // @todo - 개시 시점이 종료 시점보다 한 달 이상 앞서야 하는 것으로
        input.opened_at !== null &&
        current.closed_at !== null &&
        (input.opened_at === "now" ? new Date() : new Date(input.opened_at)) <
          new Date(current.closed_at)
      )
        result.push({
          accessor: "input.opened_at",
          code: HubOrderGoodErrorCode.CLOSING_TIME_IS_EARLIER_THAN_OPENING_TIME,
          message: `${props.entity} cannot be opened before it has been closed.`,
        });
      return result;
    };

  /**
   * @internal
   */
  export const _Validate_close =
    (props: { current: (field: string) => string; entity: string }) =>
    (current: Pick<IHubOrderGood, "opened_at" | "closed_at">) =>
    (input: IHubOrderGood.IClose): IDiagnosis[] => {
      const result: IDiagnosis[] = [];

      // ALREADY CLOSED
      if (
        current.closed_at !== null &&
        new Date(current.closed_at).getTime() < Date.now()
      )
        result.push({
          accessor: `${props.current}.closed_at`,
          code: HubOrderGoodErrorCode.CLOSED,
          message: `${props.entity} has already been closed.`,
        });

      // NO OPENED_AT
      if (current.opened_at === null)
        result.push({
          accessor: `${props.current}.opened_at`,
          code: HubOrderGoodErrorCode.CLOSING_TIME_WITHOUT_OPENING_TIME,
          message: `unable to configure closed_at without opened_at.`,
        });

      // CLOSE IN THE PAST
      if (
        input.closed_at !== null &&
        new Date(input.closed_at).getTime() < Date.now() - 15_000
      )
        result.push({
          accessor: `input.closed_at`,
          code: HubOrderGoodErrorCode.CLOSING_TIME_IS_EARLIER_THAN_NOW,
          message: `${props.entity} cannot be closed in the past.`,
        });

      // CLOSE BEFORE OPENING
      if (
        input.closed_at !== null &&
        current.opened_at !== null &&
        new Date(input.closed_at) < new Date(current.opened_at)
      )
        result.push({
          accessor: "input.closed_at",
          code: HubOrderGoodErrorCode.CLOSING_TIME_WITHOUT_OPENING_TIME,
          message: `${props.entity} cannot be closed before it has been opened.`,
        });
      return result;
    };
}
