import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

import { HubConfiguration } from "../../../HubConfiguration";
import { HubGlobal } from "../../../HubGlobal";
import { HubCustomerProvider } from "../../hub/actors/HubCustomerProvider";

export namespace StudioMetaChatFreeLimitProvider {
  export const assert = async (customer: IHubCustomer) => {
    const isWhiteList = !!customer.member?.emails.some((e) =>
      e.value.endsWith("@wrtn.io"),
    );

    if (!isWhiteList) {
      const count: number =
        await HubGlobal.prisma.studio_meta_chat_session_connection_messages.count(
          {
            where: {
              connection: {
                customer: HubCustomerProvider.where(customer),
              },
              speaker: "customer",
            },
          },
        );
      if (count >= HubConfiguration.freeTalkingLimit.get())
        throw new ExceededChatLimitError();
    }
  };
}

class ExceededChatLimitError extends Error {
  constructor() {
    super(
      "The number of messages has exceeded the free limit. If you want to continue talking, please configure the LLM API key, and re-connect please.",
    );
    this.name = ExceededChatLimitError.name;
  }
}
