import { HubCartCommodityErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubCartCommodityErrorCode";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IHubCartCommodityStockChoice } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodityStockChoice";
import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";

import { IIndexedInput } from "../../common/IIndexedInput";

export namespace HubCartCommodityStockChoiceDiagnoser {
  export const validate =
    (unit: IHubSaleUnit) =>
    (stockIndex: number) =>
    (
      input: IIndexedInput<IHubCartCommodityStockChoice.ICreate>,
    ): IDiagnosis[] => {
      const output: IDiagnosis[] = [];
      const option = unit.options.find((o) => o.id === input.data.option_id);
      if (option === undefined)
        output.push({
          accessor: `items[${stockIndex}].choices[${input.index}].option_id`,
          code: HubCartCommodityErrorCode.UNIT_OPTION_NOT_FOUND,
          message: `Unable to find the matched option.`,
        });
      else {
        // SELECT TYPE OPTION
        if (option.type === "select") {
          if (input.data.value !== null)
            output.push({
              accessor: `items[${stockIndex}].choices[${input.index}].value`,
              code: HubCartCommodityErrorCode.UNIT_OPTION_VALUE_NOT_REQUIRED,
              message: `The value is not required for the select option.`,
            });
          if (input.data.candidate_id === null)
            output.push({
              accessor: `items[${stockIndex}].choices[${input.index}].candidate_id`,
              code: HubCartCommodityErrorCode.UNIT_OPTION_CANDIDATE_REQUIRED,
              message: `The candidate_id is required for the select option.`,
            });
          else {
            const candidate = option.candidates.find(
              (o) => o.id === input.data.candidate_id,
            );
            if (candidate === undefined)
              output.push({
                accessor: `items[${stockIndex}].choices[${input.index}].candidate_id`,
                code: HubCartCommodityErrorCode.UNIT_OPTION_CANDIDATE_NOT_FOUND,
                message: `Unable to find the matched candidate.`,
              });
          }
        } else {
          if (input.data.candidate_id !== null)
            output.push({
              accessor: `items[${stockIndex}].choices[${input.index}].candidate_id`,
              code: HubCartCommodityErrorCode.UNIT_OPTION_CANDIDATE_NOT_FOUND,
              message: `The candidate_id is not required for the ${option.type} option.`,
            });
          else if (input.data.value !== null) {
            if (
              option.type === "boolean" &&
              typeof input.data.value !== "boolean"
            )
              output.push({
                accessor: `items[${stockIndex}].choices[${input.index}].value`,
                code: HubCartCommodityErrorCode.UNIT_OPTION_VALUE_WRONG_TYPE,
                message: `The value must be boolean type.`,
              });
            else if (
              option.type === "number" &&
              typeof input.data.value !== "number"
            )
              output.push({
                accessor: `items[${stockIndex}].choices[${input.index}].value`,
                code: HubCartCommodityErrorCode.UNIT_OPTION_VALUE_WRONG_TYPE,
                message: `The value must be number type.`,
              });
            else if (
              option.type === "string" &&
              typeof input.data.value !== "string"
            )
              output.push({
                accessor: `items[${stockIndex}].choices[${input.index}].value`,
                code: HubCartCommodityErrorCode.UNIT_OPTION_VALUE_WRONG_TYPE,
                message: `The value must be string type.`,
              });
          }
        }
      }
      return output;
    };
}
