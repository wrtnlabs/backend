import { v4 } from "uuid";

import { HubSaleErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleErrorCode";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";
import { IHubSaleUnitOption } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitOption";
import { IHubSaleUnitOptionCandidate } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitOptionCandidate";
import { IHubSaleUnitStock } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitStock";
import { IHubSaleUnitStockChoice } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitStockChoice";

import { IIndexedInput } from "../../common/IIndexedInput";

export namespace HubSaleUnitStockChoiceDiagnoser {
  export const validate =
    (unit: IIndexedInput<IHubSaleUnit.ICreate>) =>
    (stock: IIndexedInput<IHubSaleUnitStock.ICreate>) =>
    (choice: IIndexedInput<IHubSaleUnitStockChoice.ICreate>): IDiagnosis[] => {
      const accessor: string = `input.units.[${unit.index}].stocks[${stock.index}].choices[${choice.index}]`;
      const output: IDiagnosis[] = [];

      const option: IHubSaleUnitOption.ICreate | undefined =
        unit.data.options[choice.data.option_index];
      if (option === undefined) {
        output.push({
          accessor,
          code: HubSaleErrorCode.UNIT_OPTION_NOT_FOUND,
          message: `Option index ${choice.data.option_index} is out of bounds.`,
        });
      } else if (option.type !== "select")
        output.push({
          accessor,
          code: HubSaleErrorCode.INVALID_OPTION_TYPE,
          message: `Option type must be "select".`,
        });
      else if (option.variable === false)
        output.push({
          accessor,
          code: HubSaleErrorCode.INVALID_OPTION_TYPE,
          message: `Option is not variable.`,
        });
      else if (option.candidates[choice.data.candidate_index] === undefined)
        output.push({
          accessor,
          code: HubSaleErrorCode.OPTION_CANDIDATE_NOT_FOUND,
          message: `Candidate index ${choice.data.candidate_index} is out of bounds.`,
        });
      return output;
    };

  export const preview =
    (options: IHubSaleUnitOption[]) =>
    (input: IHubSaleUnitStockChoice.ICreate): IHubSaleUnitStockChoice => {
      const option: IHubSaleUnitOption | undefined =
        options[input.option_index];
      if (option === undefined)
        throw new Error(
          "Error on HubSaleUnitStockChoiceDiagnoser.previe(): unable to find the matched option.",
        );
      else if (option.type !== "select")
        throw new Error(
          "Error on HubSaleUnitStockChoiceDiagnoser.previe(): option type must be 'select'.",
        );
      else if (option.variable === false)
        throw new Error(
          "Error on HubSaleUnitStockChoiceDiagnoser.previe(): option must be variable.",
        );

      const candidate: IHubSaleUnitOptionCandidate | undefined =
        option.candidates[input.candidate_index];
      if (candidate === undefined)
        throw new Error(
          "Error on HubSaleUnitStockChoiceDiagnoser.previe(): unable to find the matched candidate.",
        );
      return {
        id: v4(),
        option_id: option.id,
        candidate_id: candidate.id,
      };
    };

  export const replica =
    (options: IHubSaleUnitOption[]) =>
    (input: IHubSaleUnitStockChoice): IHubSaleUnitStockChoice.ICreate => {
      const optionIndex: number = options.findIndex(
        (o) => o.id === input.option_id,
      );
      if (optionIndex === -1)
        throw new Error(
          "Error on HubSaleUnitStockChoiceDiagnoser.replica(): unable to find the matched option.",
        );

      const option: IHubSaleUnitOption = options[optionIndex];
      if (option.type !== "select")
        throw new Error(
          "Error on HubSaleUnitStockChoiceDiagnoser.replica(): option type must be 'select'.",
        );
      else if (option.variable === false)
        throw new Error(
          "Error on HubSaleUnitStockChoiceDiagnoser.replica(): option must be variable.",
        );

      const candidateIndex: number = option.candidates.findIndex(
        (c) => c.id === input.candidate_id,
      );
      if (candidateIndex === -1)
        throw new Error(
          "Error on HubSaleUnitStockChoiceDiagnoser.replica(): unable to find the matched candidate.",
        );

      return {
        option_index: optionIndex,
        candidate_index: candidateIndex,
      };
    };
}
