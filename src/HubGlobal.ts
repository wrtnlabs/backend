import { PrismaClient } from "@prisma/client";
import "@wrtnlabs/schema";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { WebSocketAcceptor } from "tgrid";
import { MutableSingleton, Singleton } from "tstl";
import typia from "typia";

import { HubMutex } from "./HubMutex";

export class HubGlobal {
  public static testing = false;
  public static mock = false;

  public static readonly prisma: PrismaClient = new PrismaClient();
  public static readonly acceptors: Set<
    WebSocketAcceptor<any, any, ISigTermListener>
  > = new Set();

  public static get env(): HubGlobal.IEnvironments {
    return environments.get();
  }

  /**
   * Current mode.
   *
   *   - local: The server is on your local machine.
   *   - dev: The server is for the developer.
   *   - real: The server is for the real service.
   */
  public static get mode(): "local" | "dev" | "real" {
    return (modeWrapper.value ??= environments.get().HUB_MODE);
  }

  /**
   * Set current mode.
   *
   * @param mode The new mode
   */
  public static setMode(mode: typeof HubGlobal.mode): void {
    typia.assert<typeof mode>(mode);
    modeWrapper.value = mode;
  }

  public static readonly mutex = new MutableSingleton(() => HubMutex.slave());
}

export namespace HubGlobal {
  export interface IEnvironments {
    LOCAL_IP?: string;

    /* -----------------------------------------------------------
      HUB SYSTEM
    ----------------------------------------------------------- */
    // BASIC SERVER INFO
    HUB_MODE: "local" | "dev" | "real";
    HUB_API_PORT: `${number}`;
    HUB_API_HOST: string;
    HUB_PROXY_PORT: `${number}`;
    HUB_PROXY_HOST: string;
    HUB_MUTEX_PORT: `${number}`;
    HUB_MASTER_IP: string;
    HUB_SYSTEM_PASSWORD: string;

    // DATABASE
    HUB_POSTGRES_HOST: string;
    HUB_POSTGRES_PORT: `${number}`;
    HUB_POSTGRES_DATABASE: string;
    HUB_POSTGRES_SCHEMA: string;
    HUB_POSTGRES_USERNAME: string;
    HUB_POSTGRES_USERNAME_READONLY: string;
    HUB_POSTGRES_PASSWORD: string;
    HUB_POSTGRES_URL: string;

    // ENCRYPTIONS
    HUB_DEPOSIT_CHARGE_ENCRYPTION_KEY: string;
    HUB_DEPOSIT_CHARGE_ENCRYPTION_IV: string;
    HUB_JWT_SECRET_KEY: string;
    HUB_JWT_REFRESH_KEY: string;
    HUB_MUTEX_PASSWORD: string;
    HUB_CITIZEN_ENCRYPTION_KEY: string;
    HUB_CITIZEN_ENCRYPTION_IV: string;
    HUB_EXTERNAL_USER_ENCRYPTION_KEY: string;
    HUB_EXTERNAL_USER_ENCRYPTION_IV: string;
    HUB_PUSH_MESSAGE_HISTORY_ENCRYPTION_KEY: string;
    HUB_PUSH_MESSAGE_HISTORY_ENCRYPTION_IV: string;
    HUB_ORDER_GOOD_HISTORY_ENCRYPTION_KEY: string;
    HUB_ORDER_GOOD_HISTORY_ENCRYPTION_IV: string;
    STUDIO_ACCOUNT_LLM_KEY_ENCRYPTION_KEY: string;
    STUDIO_ACCOUNT_LLM_KEY_ENCRYPTION_IV: string;
    STUDIO_ACCOUNT_SECRET_VALUE_ENCRYPTION_KEY: string;
    STUDIO_ACCOUNT_SECRET_VALUE_ENCRYPTION_IV: string;
    STUDIO_META_CHAT_SESSION_CONNECTION_LOG_ENCRYPTION_KEY: string;
    STUDIO_META_CHAT_SESSION_CONNECTION_LOG_ENCRYPTION_IV: string;
    STUDIO_META_CHAT_SESSION_MESSAGE_ENCRYPTION_KEY: string;
    STUDIO_META_CHAT_SESSION_MESSAGE_ENCRYPTION_IV: string;
    STUDIO_META_CHAT_SESSION_STORAGE_ENCRYPTION_KEY: string;
    STUDIO_META_CHAT_SESSION_STORAGE_ENCRYPTION_IV: string;

    // FREE LIMIT
    FREE_TALKING_LIMIT: `${number}`;

    /* -----------------------------------------------------------
      PAYMENT SYSTEM
    ----------------------------------------------------------- */
    // BASIC SERVER INFO
    PAYMENT_MODE: "local" | "dev" | "real";
    PAYMENT_API_PORT: `${number}`;

    // DATABASE
    PAYMENT_POSTGRES_HOST: string;
    PAYMENT_POSTGRES_PORT: `${number}`;
    PAYMENT_POSTGRES_DATABASE: string;
    PAYMENT_POSTGRES_SCHEMA: string;
    PAYMENT_POSTGRES_USERNAME: string;
    PAYMENT_POSTGRES_USERNAME_READONLY: string;
    PAYMENT_POSTGRES_PASSWORD: string;
    PAYMENT_POSTGRES_URL: string;

    // ENCRYPTIONS
    PAYMENT_CONNECTION_ENCRYPTION_KEY: string;
    PAYMENT_CONNECTION_ENCRYPTION_IV: string;
    PAYMENT_HISTORY_ENCRYPTION_KEY: string;
    PAYMENT_HISTORY_ENCRYPTION_IV: string;
    PAYMENT_RESERVATION_ENCRYPTION_KEY: string;
    PAYMENT_RESERVATION_ENCRYPTION_IV: string;
    PAYMENT_CANCEL_HISTORY_ENCRYPTION_KEY: string;
    PAYMENT_CANCEL_HISTORY_ENCRYPTION_IV: string;

    // VENDORS
    PAYMENT_IAMPORT_KEY: string;
    PAYMENT_IAMPORT_SECRET: string;
    PAYMENT_TOSS_PAYMENTS_SECRET: string;

    /* -----------------------------------------------------------
      INFRASTRUCTURE
    ----------------------------------------------------------- */
    // AMAZON WEB SERVICES
    AWS_REGION: string;
    AWS_BUCKET: string;

    PLATFORM_API_HOST: string;

    SLACK_TOKEN: string;
    GOOGLE_APPLICATION_CREDENTIALS?: string;
    RETOOL_URL: string;
    CONNECTOR_BUCKET: string;
    STORE_EMAIL: string;
    STORE_GOOGLE_UID: string;
    STUDIO_GOOGLE_UID: string;

    CONNECTOR_SYNC_PASSWORD: string;

    /* -----------------------------------------------------------
      VENDORS
    ----------------------------------------------------------- */
    // GOOGLE OAUTH
    GOOGLE_OAUTH_CLIENT_SECRET: string;
    GOOGLE_OAUTH_CLIENT_ID: string;
    GMAIL_APP_SECRET: string;
    GMAIL_USER: string;

    // APPLE OAUTH
    APPLE_OAUTH_CLIENT_ID: string;
    APPLE_OAUTH_TEAM_ID: string;
    APPLE_OAUTH_KEY_ID: string;
    APPLE_OAUTH_ALGORITHM: string;
    APPLE_OAUTH_PRIVATE_KEY: string;

    // NAVER OAUTH
    NAVER_OAUTH_CLIENT_SECRET: string;
    NAVER_OAUTH_CLIENT_ID: string;

    // KAKAO OAUTH
    KAKAO_OAUTH_CLIENT_SECRET: string;
    KAKAO_OAUTH_CLIENT_ID: string;

    /* -----------------------------------------------------------
      MODEL
    ----------------------------------------------------------- */
    OPENAI_API_KEY: string;
    TEST_GOOGLE_SECRET_KEY?: string;
  }
}

interface IMode {
  value?: "local" | "dev" | "real";
}

const environments = new Singleton(() => {
  if (process.env.HUB_MODE === "local") {
    const env = dotenv.config();
    dotenvExpand.expand(env);
  }
  return typia.assert<HubGlobal.IEnvironments>(process.env);
});
const modeWrapper: IMode = {};

interface ISigTermListener {
  sigterm(): Promise<void>;
}
