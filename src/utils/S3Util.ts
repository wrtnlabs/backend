import {
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Prisma } from "@prisma/client";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { IPresignedUrl } from "@wrtnlabs/os-api/lib/structures/common/IPresignedUrl";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

import { ErrorProvider } from "../providers/common/ErrorProvider";

import { HubGlobal } from "../HubGlobal";

interface ParsedS3Url {
  bucket: string;
  region: string;
  key: string;
}

export namespace S3Util {
  export const getPutObjectUrl = async (
    customerId: string,
  ): Promise<IPresignedUrl> => {
    const urlExpDate = new Date();
    urlExpDate.setMinutes(
      urlExpDate.getMinutes() + EXPIRATION_IN_MINUTES * 1000 * 60,
    );

    const bucket = HubGlobal.env.AWS_BUCKET;
    const key = s3Key(customerId);

    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
      {
        expiresIn: 60 * EXPIRATION_IN_MINUTES,
        signingRegion: HubGlobal.env.AWS_REGION,
      },
    );

    return {
      fileUploadUrl: uploadUrl,
      urlExpTsMillis: urlExpDate.toISOString(),
      bucket,
      key,
    };
  };

  export const getPutObjectUrlV2 = async (props: {
    customer: IHubCustomer;
    extension: string;
    name: string;
  }): Promise<IPresignedUrl> => {
    if (props.customer.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "Not joined member.",
      });
    }

    const urlExpDate = new Date();
    urlExpDate.setMinutes(
      urlExpDate.getMinutes() + EXPIRATION_IN_MINUTES * 1000 * 60,
    );

    const bucket = HubGlobal.env.AWS_BUCKET;
    const key = s3KeyV2({
      customer: props.customer,
      extension: props.extension,
      name: props.name,
    });

    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
      {
        expiresIn: 60 * EXPIRATION_IN_MINUTES,
        signingRegion: HubGlobal.env.AWS_REGION,
      },
    );

    return {
      fileUploadUrl: uploadUrl,
      urlExpTsMillis: urlExpDate.toISOString(),
      bucket,
      key,
    };
  };

  export const putObject = async (props: {
    path: string;
    type: string;
    body: Required<PutObjectCommandInput>["Body"];
  }) => {
    const httpPath: string = props.path.startsWith("./")
      ? props.path.slice(1)
      : props.path.startsWith("/")
        ? props.path
        : `/${props.path}`;
    const input: PutObjectCommandInput = {
      Bucket: HubGlobal.env.AWS_BUCKET,
      Key: httpPath.slice(1),
      Body: props.body,
      ContentType: props.type,
    };

    try {
      const command: PutObjectCommand = new PutObjectCommand(input);
      await s3.send(command);
    } catch (error) {
      throw ErrorProvider.internal({
        code: CommonErrorCode.S3_INTERNAL_ERROR,
        message: error instanceof Error ? error.message : "S3 Upload Failed",
      });
    }
    return `https://${input.Bucket}.s3.${HubGlobal.env.AWS_REGION}.amazonaws.com${httpPath}`;
  };

  const s3Key = (id: string) => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    const hour = String(now.getUTCHours()).padStart(2, "0");
    const minute = String(now.getUTCMinutes()).padStart(2, "0");
    const second = String(now.getUTCSeconds()).padStart(2, "0");
    const millisecond = String(now.getUTCMilliseconds()).padStart(3, "0");

    return `${year}/${month}/${day}/${hour}/${minute}/${second}/${millisecond}/${encodeURIComponent(id)}`;
  };

  const s3KeyV2 = (props: {
    customer: IHubCustomer;
    extension: string;
    name: string;
  }) => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    const hour = String(now.getUTCHours()).padStart(2, "0");

    return `${year}/${month}/${day}/${hour}/${encodeURIComponent(props.customer.member!.id)}/${encodeURIComponent(props.name)}.${props.extension}`;
  };

  // TODO(mark): beware when output gets larger
  /**
   * Transforms S3 URLs in output to presigned URLs
   */
  export const transformOutput = async (output: Prisma.JsonValue) => {
    if (output === null) {
      return null;
    }
    let stringified = JSON.stringify(output);
    const matches = stringified.match(
      /https?:\/\/([^.]+)\.s3(?:\.([^.]+))?\.amazonaws\.com\/([\p{L}\p{N}\/.-]+)/gu,
    );

    // return original object if no S3Urls
    if (!matches) {
      return output;
    }

    const transformed = await Promise.all(
      matches.map(async (match) => S3Util.getGetObjectUrl(match)),
    );

    matches.forEach((match, index) => {
      stringified = stringified.replace(match, transformed[index]);
    });
    return JSON.parse(stringified);
  };

  export const getGetObjectUrl = async (fileUrl: string) => {
    if (HubGlobal.testing === true) return fileUrl;

    const match = fileUrl.match(
      /https?:\/\/([^.]+)\.s3(?:\.([^.]+))?\.amazonaws\.com\/(.+)/,
    );

    if (!match) {
      throw new Error("Invalid format");
    }

    const bucket = match[1];
    const key = match[3];

    return await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      {
        expiresIn: 60 * EXPIRATION_IN_MINUTES,
        signingRegion: HubGlobal.env.AWS_REGION,
      },
    );
  };

  export const getObject = async (url: string) => {
    try {
      const parse = parseUrl(url);

      const command = new GetObjectCommand({
        Bucket: parse.bucket,
        Key: parse.key,
      });

      const response = await s3.send(command);
      const str = await response.Body?.transformToString();

      if (!str) {
        throw ErrorProvider.internal({
          code: CommonErrorCode.S3_INTERNAL_ERROR,
          message: "S3 GetObject Failed",
        });
      }

      return str;
    } catch (err) {
      throw ErrorProvider.internal({
        code: CommonErrorCode.S3_INTERNAL_ERROR,
        message: err instanceof Error ? err.message : "S3 GetObject Failed",
      });
    }
  };

  const parseUrl = (s3Url: string): ParsedS3Url => {
    const regex = /^https:\/\/([^.]+)\.s3\.([^.]+)\.amazonaws\.com\/(.+)$/;

    // 형식 확인: bucket-name.s3.region.amazonaws.com
    const match = s3Url.match(regex);

    if (!match) {
      throw ErrorProvider.badRequest({
        code: CommonErrorCode.INVALID_S3_URL,
        message: "Invalid S3 URL",
      });
    }

    return {
      bucket: match[1],
      region: match[2],
      key: decodeURIComponent(match[3]),
    };
  };
}

const s3 = new S3Client({
  region: HubGlobal.env.AWS_REGION,
  maxAttempts: 3,
});
const EXPIRATION_IN_MINUTES = 3;
