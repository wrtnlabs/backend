import { HubSystematicErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSystematicErrorCode";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IHubSaleChannel } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleChannel";

import { IIndexedInput } from "../../common/IIndexedInput";
import { UniqueDiagnoser } from "../../common/UniqueDiagnoser";

export namespace HubSaleChannelDiagnoser {
  export const validate = (
    channel: IIndexedInput<IHubSaleChannel.ICreate>,
  ): IDiagnosis[] =>
    UniqueDiagnoser.validate<string>({
      key: (str) => str,
      message: (str, i) => ({
        accessor: `input.channels[${i}]`,
        code: HubSystematicErrorCode.CATEGORY_DUPICATED,
        message: `Duplicated category id: "${str}"`,
      }),
    })(channel.data.category_ids);

  export const replica = (input: IHubSaleChannel): IHubSaleChannel.ICreate => ({
    code: input.code,
    category_ids: input.categories.map((c) => c.id),
  });
}
