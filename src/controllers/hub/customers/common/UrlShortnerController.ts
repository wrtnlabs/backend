import core from "@nestia/core";
import { Controller, Get, Param, Res } from "@nestjs/common";
import { FastifyReply } from "fastify";

import { IShortLink } from "@wrtnlabs/os-api/lib/structures/common/IShortLink";

import { ShortUrlUtil } from "../../../../utils/ShortUrlUtil";

@Controller("url")
export class UrlShortnerController {
  /**
   * @ignore
   */
  @core.TypedRoute.Post("shorten")
  async createShortUrl(
    @core.TypedBody() input: IShortLink.IRequest,
  ): Promise<IShortLink.IResponse> {
    return await ShortUrlUtil.createShortUrl(input);
  }

  /**
   * @ignore
   */
  @Get(":code")
  async redirectShortUrl(
    @Param("code") code: string,
    @Res() res: FastifyReply,
  ): Promise<void> {
    const originalUrl = await ShortUrlUtil.getOriginalUrl(code);
    // eslint-disable-next-line
    res.status(301).redirect(originalUrl);
  }
}
