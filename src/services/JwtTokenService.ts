import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";

import { ErrorProvider } from "../providers/common/ErrorProvider";

import { JwtTokenManager } from "../utils/JwtTokenManager";

export namespace JwtTokenService {
  export const authorize = async (props: {
    table: string;
    request: {
      headers: { authorization?: string };
    };
  }): Promise<JwtTokenManager.IAsset> => {
    // VALIDATE HEADERS
    if (!props.request.headers.authorization)
      throw ErrorProvider.unauthorized({
        accessor: "headers.authorization",
        code: HubActorErrorCode.TOKEN_NOT_FOUND,
        message: "no token value exists",
      });
    else if (
      props.request.headers.authorization.startsWith(BEARER_PREFIX) === false
    )
      throw ErrorProvider.unauthorized({
        accessor: "headers.authorization",
        code: HubActorErrorCode.INVALID_TOKEN,
        message: "invalid token",
      });

    // PARSE TOKEN
    try {
      const token: string = props.request.headers.authorization.substring(
        BEARER_PREFIX.length,
      );
      const asset: JwtTokenManager.IAsset =
        await JwtTokenManager.verify("access")(token);
      if (!asset)
        throw ErrorProvider.unauthorized({
          accessor: "headers.authorization",
          code: HubActorErrorCode.INVALID_TOKEN,
          message: "invalid token",
        });
      else if (asset.table !== props.table)
        throw ErrorProvider.unauthorized({
          accessor: "headers.authorization",
          code: HubActorErrorCode.INVALID_TOKEN,
          message: "invalid token",
        });
      else if (new Date(asset.expired_at).getTime() < Date.now())
        throw ErrorProvider.unauthorized({
          accessor: "headers.authorization",
          code: HubActorErrorCode.EXPIRED_TOKEN,
          message: "expired token",
        });
      return asset;
    } catch {
      throw ErrorProvider.unauthorized({
        accessor: "headers.authorization",
        code: HubActorErrorCode.INVALID_TOKEN,
        message: "invalid token",
      });
    }
  };
}

const BEARER_PREFIX: string = "Bearer ";
