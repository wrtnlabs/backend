export const enum StudioEnterpriseEmployeeErrorCode {
  /**
   * Lack of position.
   *
   * This means that the job cannot be done due to low position.
   */
  INSUFFICIENT_TITLE = "STUDIO_ENTERPRISE_EMPLOYEE_INSUFFICIENT_TITLE",

  /**
   * Not an employee of the company.
   */
  NOT_A_CLERK = "STUDIO_ENTERPRISE_EMPLOYEE_NOT_A_CLERK",

  /**
   * Not invited.
   */
  NOT_INVITED = "STUDIO_ENTERPRISE_EMPLOYEE_NOT_INVITED",

  /**
   * Not accepting the invitation.
   */
  NOT_APPROVED = "STUDIO_ENTERPRISE_EMPLOYEE_NOT_APPROVED",
}
