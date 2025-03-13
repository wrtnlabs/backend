import { OpenApi, OpenApiV3, OpenApiV3_1, SwaggerV2 } from "@samchon/openapi";
import { tags } from "typia";

/**
 * Swagger Translation.
 *
 * @author Samchon
 */
export interface ISwaggerTranslation {
  /**
   * URL containing the translated Swagger file.
   */
  url: string & tags.Format<"uri">;

  /**
   * Target language of the translation.
   */
  language: string;
}
export namespace ISwaggerTranslation {
  export type IRequest = IUrlRequest | IDocumentRequest;
  export interface IUrlRequest {
    type: "url";
    url: string & tags.Format<"uri">;
    language: string;
  }
  export interface IDocumentRequest {
    type: "document";
    document:
      | SwaggerV2.IDocument
      | OpenApiV3.IDocument
      | OpenApiV3_1.IDocument
      | OpenApi.IDocument;
    language: string;
  }
}
