import { RandomGenerator } from "@nestia/e2e";
import { v4 } from "uuid";

import { HubGlobal } from "../HubGlobal";
import { IShortLink } from "../api/structures/common/IShortLink";

export namespace ShortUrlUtil {
  export const createShortUrl = async (
    input: IShortLink.IRequest,
  ): Promise<IShortLink.IResponse> => {
    const code = RandomGenerator.alphabets(8);
    await HubGlobal.prisma.short_urls.create({
      data: {
        id: v4(),
        original_url: input.originalUrl,
        code: code,
        created_at: new Date(),
      },
    });
    return {
      code: code,
    };
  };

  export const getOriginalUrl = async (code: string): Promise<string> => {
    const url = await HubGlobal.prisma.short_urls.findFirstOrThrow({
      where: {
        code: code,
      },
    });
    return url.original_url;
  };
}
