import { tags } from "typia";

/**
 * S3 Presigned URL.
 *
 * Presigned URL information for uploading S3 objects.
 */
export interface IPresignedUrl {
  /**
   *  S3 Presigned URL.
   */
  fileUploadUrl: string;

  /**
   * S3 Presigned URL expiration time.
   */
  urlExpTsMillis: string & tags.Format<"date-time">;

  /**
   * s3 bucket being uploaded.
   */
  bucket: string;

  /**
   * s3 key being uploaded.
   */
  key: string;
}

export namespace IPresignedUrl {
  export interface ICreate {
    /**
     * File name.
     */
    name: string;

    /**
     * File extension.
     */
    extension: string;

    // bucket: "store" | "studio" | "workflow"; //TODO : 추후에 추가
  }
}
