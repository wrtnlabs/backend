import { WebSocketAdaptor } from "@nestia/core";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import FastifyMulter from "fastify-multer";
import { Logger } from "nestjs-pino";
import { sleep_for } from "tstl";

import { HubConfiguration } from "./HubConfiguration";
import { HubGlobal } from "./HubGlobal";
import { HubModule } from "./HubModule";
import { HttpExceptionFilter } from "./pipes/HttpExceptionFilters";

export class HubBackend {
  private application_?: NestFastifyApplication;

  public async open(port?: number): Promise<void> {
    //----
    // OPEN THE BACKEND SERVER
    //----
    // MOUNT CONTROLLERS
    this.application_ = await NestFactory.create(
      HubModule(),
      new FastifyAdapter({
        bodyLimit: 100 * 1024 * 1024,
      }),
      { logger: false },
    );
    this.application_.enableCors();
    this.application_.register(FastifyMulter.contentParser as any);
    await WebSocketAdaptor.upgrade(this.application_);

    // DO OPEN
    if (HubGlobal.testing === true) {
      this.application_.useStaticAssets({
        root: `${HubConfiguration.ROOT}/packages/public`,
        prefix: "/public",
      });
      // this.application_.useLogger(this.application_.get(Logger));
      // this.application_.useGlobalFilters(
      //   new HttpExceptionFilter(this.application_.getHttpAdapter()),
      // );
    } else {
      this.application_.useLogger(this.application_.get(Logger));
      this.application_.useGlobalFilters(
        new HttpExceptionFilter(this.application_.getHttpAdapter()),
      );
    }
    await this.application_.listen(
      port ?? HubConfiguration.API_PORT(),
      "0.0.0.0",
    );
  }

  public async close(): Promise<void> {
    if (this.application_ === undefined) return;

    for (const acceptor of HubGlobal.acceptors) {
      const driver = acceptor.getDriver();
      driver.sigterm().catch(() => {});
    }
    if (HubGlobal.acceptors.size !== 0) await sleep_for(10_000);
    await this.application_.close();
    delete this.application_;
  }
}
