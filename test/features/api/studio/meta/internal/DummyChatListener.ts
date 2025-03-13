import { IStudioMetaChatListener } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatListener";
import { IStudioMetaChatServiceCancelFunction } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceCancelFunction";
import { IStudioMetaChatServiceCompleteFunction } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceCompleteFunction";
import { IStudioMetaChatServiceDescribeFunctions } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceDescribeFunctions";
import { IStudioMetaChatServiceDialogue } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceDialogue";
import { IStudioMetaChatServiceFillArguments } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceFillArguments";
import { IStudioMetaChatServiceSelectFunction } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceSelectFunction";
import { IStudioMetaChatServiceTokenUsage } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceTokenUsage";

export class DummyChatListener implements IStudioMetaChatListener {
  public constructor(
    private readonly listener?: Partial<IStudioMetaChatListener>,
  ) {}

  public async talk(_dialogue: IStudioMetaChatServiceDialogue): Promise<void> {}

  public async selectFunction(
    _props: IStudioMetaChatServiceSelectFunction,
  ): Promise<void> {}

  public async cancelFunction(
    _props: IStudioMetaChatServiceCancelFunction,
  ): Promise<void> {}

  public async fillArguments(
    _props: IStudioMetaChatServiceFillArguments,
  ): Promise<IStudioMetaChatServiceFillArguments.IResponse> {
    return {
      determinant: "accept",
      arguments: {},
    };
  }

  public async completeFunction(
    _props: IStudioMetaChatServiceCompleteFunction,
  ): Promise<void> {}

  public async describeFunctionCalls(
    _props: IStudioMetaChatServiceDescribeFunctions,
  ): Promise<void> {}

  public async tokenUsage(
    event: IStudioMetaChatServiceTokenUsage,
  ): Promise<void> {
    if (this.listener?.tokenUsage) await this.listener.tokenUsage(event);
  }
}
