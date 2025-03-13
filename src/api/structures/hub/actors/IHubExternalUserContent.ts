/**
 * External user information details.
 *
 * An object containing user information provided by WRTN SSO.
 *
 * @author Asher
 */
export interface IHubExternalUserContent
  extends IHubExternalUserContent.ICreate {
  /**
   *  Primary key.
   */
  id: string;
}

export namespace IHubExternalUserContent {
  /**
   * User job information.
   *
   * Also edit line 390 of {@link HubSSOProvider}
   */
  export type JobType =
    | "학생"
    | "일반 사무직"
    | "교육직(교수, 교사, 학원강사 등)"
    | "개발자"
    | "자영업자"
    | "사업가(제조업, IT 등)"
    | "마케터"
    | "크리에이터(블로거, 유튜버 등)"
    | "전문직(변호사, 의사 등)"
    | "디자이너"
    | "무직"
    | "기타"
    | (string & {});

  export type GenderType = "m" | "f" | "none";

  export interface ICreate {
    /**
     * User Email.
     */
    // email: string;

    /**
     * List of user job information. {@link IHubExternalUserContent.JobType}
     */
    jobs: string[] | null;

    /**
     * User gender information.
     *
     * `m` : male
     * `f` : female
     * `none` : gender not disclosed
     */
    gender: GenderType;

    /**
     * User's year of birth.
     */
    birthYear: number | null;

    /**
     * List of user interests.
     */
    interests: string[] | null;

    /**
     * WRTN User Account Provider.
     *
     * ex) "google", "kakao", "naver"
     */
    provider: string | null;

    /**
     * Purpose of user access.
     */
    purposes: string[] | null;
  }
}
