import { v4 } from "uuid";

import { HubSaleErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleErrorCode";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";
import { IHubSaleUnitOption } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitOption";
import { IHubSaleUnitOptionCandidate } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitOptionCandidate";

import { IIndexedInput } from "../../common/IIndexedInput";
import { UniqueDiagnoser } from "../../common/UniqueDiagnoser";

export namespace HubSaleUnitOptionDiagnoser {
  export const validate =
    (unit: IIndexedInput<IHubSaleUnit.ICreate>) =>
    (option: IIndexedInput<IHubSaleUnitOption.ICreate>): IDiagnosis[] => {
      if (option.data.type !== "select") return [];

      const accessor: string = `input.units[${unit.index}].options[${option.index}]`;
      const output: IDiagnosis[] = [];

      if (option.data.candidates.length === 0)
        output.push({
          accessor: `${accessor}.candidates`,
          code: HubSaleErrorCode.EMPTY_OPTION_CANDIDATES,
          message:
            'Candidates must not be empty when type of the option is "select".',
        });
      output.push(
        ...UniqueDiagnoser.validate<IHubSaleUnitOptionCandidate.ICreate>({
          key: (c) => c.name,
          message: (c, i) => ({
            accessor: `${accessor}.candidates[${i}]`,
            code: HubSaleErrorCode.EXIST_OPTION_CANDIDATE_NAME,
            message: `Duplicated candidate name: "${c.name}"`,
          }),
        })(option.data.candidates),
      );
      return output;
    };

  export const preview = (
    input: IHubSaleUnitOption.ICreate,
  ): IHubSaleUnitOption =>
    input.type === "select"
      ? {
          id: v4(),
          type: input.type,
          name: input.name,
          variable: input.variable,
          candidates: input.candidates.map((c) => ({
            id: v4(),
            name: c.name,
          })),
        }
      : {
          id: v4(),
          type: input.type,
          name: input.name,
        };

  export const replica = (
    input: IHubSaleUnitOption,
  ): IHubSaleUnitOption.ICreate =>
    input.type === "select"
      ? {
          type: input.type,
          name: input.name,
          variable: input.variable,
          candidates: input.candidates.map((c) => ({
            name: c.name,
          })),
        }
      : {
          type: input.type,
          name: input.name,
        };
}
