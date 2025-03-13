import { Driver } from "tgrid";

import { IExecutionResult } from "@wrtnlabs/os-api/lib/structures/common/IExecutionResult";
import { IStudioMetaChatListener } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatListener";
import { IStudioMetaChatServiceCancelFunction } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceCancelFunction";
import { IStudioMetaChatServiceCompleteFunction } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceCompleteFunction";
import { IStudioMetaChatServiceDescribeFunctions } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceDescribeFunctions";
import { IStudioMetaChatServiceDialogue } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceDialogue";
import { IStudioMetaChatServiceFillArguments } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceFillArguments";
import { IStudioMetaChatServiceSelectFunction } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceSelectFunction";
import { IStudioMetaChatServiceTokenUsage } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceTokenUsage";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";
import { IStudioMetaChatSessionConnection } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionConnection";

import { ErrorUtil } from "../../../utils/ErrorUtil";
import { StudioMetaChatSessionMessageProvider } from "./StudioMetaChatSessionMessageProvider";

export class StudioMetaChatListener
  implements Required<IStudioMetaChatListener>
{
  public constructor(
    private readonly driver: Driver<Required<IStudioMetaChatListener>>,
    private readonly session: IStudioMetaChatSession,
    private readonly connection: IStudioMetaChatSessionConnection,
  ) {}

  public initialize(): Promise<void> {
    return this.driver.initialize();
  }

  public talk(dialogue: IStudioMetaChatServiceDialogue): Promise<void> {
    return this.process({
      kind: "talk",
      arguments: [dialogue],
      onlySuccess: false,
    });
  }

  public cancelFunction(
    props: IStudioMetaChatServiceCancelFunction,
  ): Promise<void> {
    return this.process({
      kind: "cancelFunction",
      arguments: [props],
      onlySuccess: false,
    });
  }

  public selectFunction(
    props: IStudioMetaChatServiceSelectFunction,
  ): Promise<void> {
    return this.process({
      kind: "selectFunction",
      arguments: [props],
      onlySuccess: false,
    });
  }

  public fillArguments(
    props: IStudioMetaChatServiceFillArguments,
  ): Promise<IStudioMetaChatServiceFillArguments.IResponse> {
    return this.driver.fillArguments(props);
  }

  public completeFunction(
    props: IStudioMetaChatServiceCompleteFunction,
  ): Promise<void> {
    return this.process({
      kind: "completeFunction",
      arguments: [props],
      onlySuccess: false,
    });
  }

  public describeFunctionCalls(
    props: IStudioMetaChatServiceDescribeFunctions,
  ): Promise<void> {
    return this.process({
      kind: "describeFunctionCalls",
      arguments: [props],
      onlySuccess: false,
    });
  }

  public tokenUsage(usage: IStudioMetaChatServiceTokenUsage): Promise<void> {
    return this.driver.tokenUsage(usage);
  }

  private async process<Kind extends keyof IStudioMetaChatListener>(props: {
    kind: Kind;
    arguments: Parameters<Required<IStudioMetaChatListener>[Kind]>;
    onlySuccess: boolean;
    historyId?: string | undefined;
  }): Promise<
    EscapePromise<ReturnType<Required<IStudioMetaChatListener>[Kind]>>
  > {
    const created_at: Date = new Date();
    let result: IExecutionResult<
      EscapePromise<ReturnType<Required<IStudioMetaChatListener>[Kind]>>
    > = null!;
    try {
      const value: EscapePromise<
        ReturnType<Required<IStudioMetaChatListener>[Kind]>
      > = await (this.driver[props.kind] as Function)(...props.arguments);
      result = {
        success: true,
        value,
      };
      return value;
    } catch (exp) {
      result = {
        success: false,
        error: exp,
      };
      throw exp;
    } finally {
      if (result.success === true || props.onlySuccess === false)
        StudioMetaChatSessionMessageProvider.create({
          id: props.historyId,
          session: this.session,
          connection: this.connection,
          speaker: "agent",
          type: props.kind,
          arguments: props.arguments,
          value: result.success
            ? result.value
            : props.onlySuccess === false
              ? ErrorUtil.serialize(result.error)
              : undefined,
          created_at,
        }).catch((exp) => {
          console.log("message archive failure", exp);
        });
    }
  }
}

type EscapePromise<T extends Promise<unknown>> =
  T extends Promise<infer U> ? U : never;
