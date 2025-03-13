import { TypedParam, TypedRoute } from "@nestia/core";
import { Controller, Get } from "@nestjs/common";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { IPerformance } from "@wrtnlabs/os-api/lib/structures/monitors/IPerformance";

import { ErrorProvider } from "../../providers/common/ErrorProvider";

@Controller("/_health")
export class MonitorHealthController {
  /**
   * Health Check API.
   *
   * @author Samchon
   * @tag Monitor
   */
  @Get()
  public get(): void {}

  @TypedRoute.Get("performance")
  public performance(): IPerformance {
    return {
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      resource: process.resourceUsage(),
    };
  }

  /**
   * Intended server error generator.
   *
   * @internal
   * @author Asher
   * @param status code
   */
  @Get("throws/:status")
  public throws(@TypedParam("status") status: number): void {
    throw ErrorProvider.http(status)({
      code: CommonErrorCode.INTERNAL_SERVER_ERROR,
      accessor: `${status} code`,
      message: "Indented server error.",
    });
  }
}
