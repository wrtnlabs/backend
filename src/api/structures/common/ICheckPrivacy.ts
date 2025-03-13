import { tags } from "typia";

export namespace ICheckPrivacy {
  /**
   * Request form to determine whether personal information is included
   */
  export interface IRequest {
    /**
     * Text to determine whether it contains personal information
     */
    text: string[] & tags.MinItems<1>;
  }

  /**
   * If you were caught with personal information, what words and what
   * personal information were caught?
   */
  export interface IInvalid {
    /**
     * Words that are tied to personal information
     */
    word: string;

    /**
     * What regular expression was it caught by?
     */
    regex: string;
  }
}
