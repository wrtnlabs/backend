import { StudioEnterpriseTeamErrorCode } from "@wrtnlabs/os-api/lib/constants/studio/StudioEnterpriseTeamErrorCode";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IStudioEnterpriseTeamCompanion } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseTeamCompanion";

export namespace StudioEnterpriseTeamCompanionDiagnoser {
  export const validate = (
    employee: IStudioEnterpriseTeamCompanion,
    target: IStudioEnterpriseTeamCompanion.Role,
  ): IDiagnosis[] => {
    const outputs: IDiagnosis[] = [];

    if (employee.role === "chief") return outputs;

    if (employee.role === "manager" && ["chief", "manager"].includes(target))
      outputs.push({
        accessor: "input.role",
        code: StudioEnterpriseTeamErrorCode.INSUFFICIENT_ROLE,
        message: "Manager can't invite chief or manager",
      });

    if (
      employee.role === "member" &&
      ["chief", "manager", "member", "observer"].includes(target)
    )
      outputs.push({
        accessor: "input.role",
        code: StudioEnterpriseTeamErrorCode.INSUFFICIENT_ROLE,
        message: "Member can't invite",
      });

    if (
      employee.role === "observer" &&
      ["chief", "manager", "member", "observer"].includes(target)
    )
      outputs.push({
        accessor: "input.role",
        code: StudioEnterpriseTeamErrorCode.INSUFFICIENT_ROLE,
        message: "Observer can't invite",
      });
    return outputs;
  };

  export const update = (
    employee: IStudioEnterpriseTeamCompanion,
    target: IStudioEnterpriseTeamCompanion,
  ): IDiagnosis[] => {
    const outputs: IDiagnosis[] = [];

    if (employee.role === "chief") return outputs;

    if (
      employee.role === "manager" &&
      ["chief", "manager"].includes(target.role)
    )
      outputs.push({
        accessor: "input.role",
        code: StudioEnterpriseTeamErrorCode.INSUFFICIENT_ROLE,
        message: "Manager can't invite chief or manager",
      });

    if (
      employee.role === "member" &&
      ["chief", "manager", "member", "observer"].includes(target.role)
    )
      outputs.push({
        accessor: "input.role",
        code: StudioEnterpriseTeamErrorCode.INSUFFICIENT_ROLE,
        message: "Member can't invite",
      });

    if (
      employee.role === "observer" &&
      ["chief", "manager", "member", "observer"].includes(target.role)
    )
      outputs.push({
        accessor: "input.role",
        code: StudioEnterpriseTeamErrorCode.INSUFFICIENT_ROLE,
        message: "Observer can't invite",
      });

    return outputs;
  };

  export const erase = (
    employee: IStudioEnterpriseTeamCompanion,
    target: IStudioEnterpriseTeamCompanion,
  ): IDiagnosis[] => {
    const outputs: IDiagnosis[] = [];

    if (employee.role === "chief") return outputs;

    if (
      employee.role === "manager" &&
      ["chief", "manager"].includes(target.role)
    )
      outputs.push({
        accessor: "input.role",
        code: StudioEnterpriseTeamErrorCode.INSUFFICIENT_ROLE,
        message: "Manager can't invite chief or manager",
      });

    if (
      employee.role === "member" &&
      ["chief", "manager"].includes(target.role)
    )
      outputs.push({
        accessor: "input.role",
        code: StudioEnterpriseTeamErrorCode.INSUFFICIENT_ROLE,
        message: "Member can't invite",
      });

    if (
      employee.role === "observer" &&
      ["chief", "manager", "member", "observer"].includes(target.role)
    )
      outputs.push({
        accessor: "input.role",
        code: StudioEnterpriseTeamErrorCode.INSUFFICIENT_ROLE,
        message: "Observer can't invite",
      });

    return outputs;
  };

  export const accessible = (props: {
    actual: IStudioEnterpriseTeamCompanion.Role;
    target: IStudioEnterpriseTeamCompanion.Role;
  }): boolean => sequence(props.actual) <= sequence(props.target);

  export const compare = (
    x: IStudioEnterpriseTeamCompanion.Role,
    y: IStudioEnterpriseTeamCompanion.Role,
  ): number => sequence(x) - sequence(y);

  const sequence = (role: IStudioEnterpriseTeamCompanion.Role): number => {
    switch (role) {
      case "chief":
        return 0;
      case "manager":
        return 1;
      case "member":
        return 2;
      case "observer":
        return 3;
    }
  };
}
