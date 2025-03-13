import { StudioEnterpriseEmployeeErrorCode } from "@wrtnlabs/os-api/lib/constants/studio/StudioEnterpriseEmployeeErrorCode";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IStudioEnterpriseEmployee } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseEmployee";

export namespace StudioEnterpriseTeamDiagnoser {
  export const validate = (
    target: IStudioEnterpriseEmployee.Title,
  ): IDiagnosis[] => {
    const outputs: IDiagnosis[] = [];

    if (target === "owner") return outputs;

    if (target === "member")
      outputs.push({
        accessor: "input.title",
        code: StudioEnterpriseEmployeeErrorCode.INSUFFICIENT_TITLE,
        message: "Member can't create team",
      });

    if (target === "observer")
      outputs.push({
        accessor: "input.title",
        code: StudioEnterpriseEmployeeErrorCode.INSUFFICIENT_TITLE,
        message: "Observer can't create team",
      });

    return outputs;
  };

  export const update = (
    target: IStudioEnterpriseEmployee.Title,
  ): IDiagnosis[] => {
    const outputs: IDiagnosis[] = [];

    if (target === "owner") return outputs;

    if (target === "member")
      outputs.push({
        accessor: "input.title",
        code: StudioEnterpriseEmployeeErrorCode.INSUFFICIENT_TITLE,
        message: "Member can't update team",
      });

    if (target === "observer")
      outputs.push({
        accessor: "input.title",
        code: StudioEnterpriseEmployeeErrorCode.INSUFFICIENT_TITLE,
        message: "Observer can't update team",
      });

    return outputs;
  };

  export const erase = (
    target: IStudioEnterpriseEmployee.Title,
  ): IDiagnosis[] => {
    const outputs: IDiagnosis[] = [];

    if (target === "owner") return outputs;

    if (target === "member")
      outputs.push({
        accessor: "input.title",
        code: StudioEnterpriseEmployeeErrorCode.INSUFFICIENT_TITLE,
        message: "Member can't delete team",
      });

    if (target === "observer")
      outputs.push({
        accessor: "input.title",
        code: StudioEnterpriseEmployeeErrorCode.INSUFFICIENT_TITLE,
        message: "Observer can't delete team",
      });

    return outputs;
  };
}
