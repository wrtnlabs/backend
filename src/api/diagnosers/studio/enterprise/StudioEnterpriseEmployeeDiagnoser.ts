import { StudioEnterpriseEmployeeErrorCode } from "@wrtnlabs/os-api/lib/constants/studio/StudioEnterpriseEmployeeErrorCode";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IStudioEnterpriseEmployee } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioEnterpriseEmployee";

export namespace StudioEnterpriseEmployeeDiagnoser {
  export const validate = (
    employee: IStudioEnterpriseEmployee,
    target: IStudioEnterpriseEmployee.ICreate,
  ): IDiagnosis[] => {
    const output: IDiagnosis[] = [];

    if (employee.title === "owner") return output;

    if (
      employee.title === "manager" &&
      ["owner", "manager"].includes(target.title)
    )
      output.push({
        accessor: "input.title",
        code: StudioEnterpriseEmployeeErrorCode.INSUFFICIENT_TITLE,
        message: "Manager can't invite owner or manager",
      });

    if (
      employee.title === "member" &&
      ["owner", "manager", "member", "observer"].includes(target.title)
    )
      output.push({
        accessor: "input.title",
        code: StudioEnterpriseEmployeeErrorCode.INSUFFICIENT_TITLE,
        message: "Member can't invite",
      });

    if (
      employee.title === "observer" &&
      ["owner", "manager", "member", "observer"].includes(target.title)
    )
      output.push({
        accessor: "input.title",
        code: StudioEnterpriseEmployeeErrorCode.INSUFFICIENT_TITLE,
        message: "Observer can't invite",
      });

    return output;
  };

  export const erase = (
    employee: IStudioEnterpriseEmployee,
    target: IStudioEnterpriseEmployee,
  ): IDiagnosis[] => {
    const output: IDiagnosis[] = [];

    if (employee.title === "owner") return output;

    if (
      employee.title === "manager" &&
      ["owner", "manager"].includes(target.title)
    )
      output.push({
        accessor: "input.title",
        code: StudioEnterpriseEmployeeErrorCode.INSUFFICIENT_TITLE,
        message: "Manager can't erase owner or manager",
      });

    if (
      employee.title === "member" &&
      ["owner", "manager", "member", "observer"].includes(target.title)
    )
      output.push({
        accessor: "input.title",
        code: StudioEnterpriseEmployeeErrorCode.INSUFFICIENT_TITLE,
        message: "Member can't erase",
      });

    if (
      employee.title === "observer" &&
      ["owner", "manager", "member", "observer"].includes(target.title)
    )
      output.push({
        accessor: "input.title",
        code: StudioEnterpriseEmployeeErrorCode.INSUFFICIENT_TITLE,
        message: "Observer can't erase",
      });

    return output;
  };

  export const update = (
    employee: IStudioEnterpriseEmployee,
    target: IStudioEnterpriseEmployee,
  ): IDiagnosis[] => {
    const output: IDiagnosis[] = [];

    if (employee.title === "owner") return output;

    if (
      employee.title === "manager" &&
      ["owner", "manager"].includes(target.title)
    )
      output.push({
        accessor: "input.title",
        code: StudioEnterpriseEmployeeErrorCode.INSUFFICIENT_TITLE,
        message: "Manager can't update owner or manager",
      });

    if (
      employee.title === "member" &&
      ["owner", "manager", "member", "observer"].includes(target.title)
    )
      output.push({
        accessor: "input.title",
        code: StudioEnterpriseEmployeeErrorCode.INSUFFICIENT_TITLE,
        message: "Member can't update",
      });

    if (
      employee.title === "observer" &&
      ["owner", "manager", "member", "observer"].includes(target.title)
    )
      output.push({
        accessor: "input.title",
        code: StudioEnterpriseEmployeeErrorCode.INSUFFICIENT_TITLE,
        message: "Observer can't update",
      });

    return output;
  };

  export const accessible = (props: {
    actual: IStudioEnterpriseEmployee.Title;
    target: IStudioEnterpriseEmployee.Title;
  }): boolean => sequence(props.actual) <= sequence(props.target);

  export const compare = (
    x: IStudioEnterpriseEmployee.Title,
    y: IStudioEnterpriseEmployee.Title,
  ): number => sequence(x) - sequence(y);

  const sequence = (role: IStudioEnterpriseEmployee.Title): number => {
    switch (role) {
      case "owner":
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
