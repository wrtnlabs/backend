import { IAgenticaOperation } from "@agentica/core";

import { IStudioMetaChatServiceOperation } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceOperation";

export namespace StudioMetaChatServiceOperationProvider {
  export const transform = (
    operation: IAgenticaOperation<"chatgpt">,
  ): IStudioMetaChatServiceOperation => ({
    protocol: operation.protocol,
    controller: operation.controller.name,
    function: operation.function.name,
    name: operation.name,
  });
}
