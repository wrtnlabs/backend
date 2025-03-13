import { OpenApi, OpenApiV3, OpenApiV3_1, SwaggerV2 } from "@samchon/openapi";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

export namespace ITranslate {
  /**
   * Information needed for translation.
   */
  export interface IRequest {
    /**
     * Swagger info.
     */
    swagger:
      | SwaggerV2.IDocument
      | OpenApiV3.IDocument
      | OpenApiV3_1.IDocument
      | OpenApi.IDocument;

    /**
     * The type of language to translate into.
     */
    tarLangType: IHubCustomer.LanguageType;
  }

  /**
   * Language detection results.
   *
   * The higher the confidence level of the language, the more likely it is
   * that language. The DTO is returned as an array, with the first element of
   * the array being the language with the highest confidence level.
   */
  export interface IDetection {
    /**
     *  language
     */
    language: string;

    /**
     * Reliability.
     */
    confidence: number;

    /**
     * Input values.
     */
    input: string;
  }

  export interface IUrl {
    /**
     *  URL
     */
    url: string & tags.Format<"uri">;
  }
}
