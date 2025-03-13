import { tags } from "typia";

export namespace IShortLink {
  export interface IRequest {
    /**
     * The original URL you want to shorten.
     *
     * @title Original URL.
     */
    originalUrl: string & tags.Format<"uri">;
  }

  export interface IResponse {
    /**
     * Identifier code.
     */
    code: string;
  }
}
