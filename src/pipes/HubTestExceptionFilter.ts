import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";

import { HubGlobal } from "../HubGlobal";

@Catch(Error)
export class HubTestExceptionFilter extends BaseExceptionFilter {
  public static readonly stack: Error[] = [];

  public catch(exception: Error, host: ArgumentsHost) {
    if (HubGlobal.testing === true)
      HubTestExceptionFilter.stack.push(exception);
    return super.catch(exception, host);
  }
}
