import JsZip from "jszip";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";
import { IStudioMetaChatSessionMessage } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionMessage";

import { StudioMetaChatSessionConnectionLogProvider } from "./StudioMetaChatSessionConnectionLogProvider";
import { StudioMetaChatSessionMessageProvider } from "./StudioMetaChatSessionMessageProvider";
import { StudioMetaChatSessionProvider } from "./StudioMetaChatSessionProvider";

export namespace StudioMetaChatSessionReportProvider {
  export const download = async (props: {
    session: IEntity;
  }): Promise<Buffer> => {
    const session: IStudioMetaChatSession =
      await StudioMetaChatSessionProvider.at({
        actor: null,
        id: props.session.id,
        readonly: true,
      });
    const messages: IPage<IStudioMetaChatSessionMessage> =
      await StudioMetaChatSessionMessageProvider.index({
        actor: undefined,
        session,
        input: {
          limit: 999_999,
          sort: ["+message.created_at"],
        },
      });

    const zip: JsZip = new JsZip();
    zip.file(
      "README.md",
      markdown({
        session,
        messages: messages.data,
      }),
    );
    zip.file("messages.json", JSON.stringify(messages.data, null, 2));
    zip.file(
      "logs.json",
      JSON.stringify(
        await StudioMetaChatSessionConnectionLogProvider.get(props),
        null,
        2,
      ),
    );
    return zip.generateAsync({
      type: "nodebuffer",
      compressionOptions: {
        level: 9,
      },
    });
  };

  export const markdown = (props: {
    header?: string;
    session?: IStudioMetaChatSession;
    messages: IStudioMetaChatSessionMessage[];
  }): string => {
    const header: string[] = (() => {
      if (props.header) return [props.header];
      else if (!props.session) return [];
      return [
        "## Session",
        `  - id: ${props.session.id}`,
        `  - title: ${props.session.title}`,
        `  - created_at: ${props.session.created_at}`,
        `  - completed_at: ${props.session.connection?.disconnected_at ?? "on going"}`,
        "",
        "## Customer",
        `  - id: ${props.session.customer.id}`,
        `  - member:`,
        `    - email: ${props.session.customer.member?.emails[0]?.value ?? "N/A"}`,
        `    - nickname: ${props.session.customer.member?.nickname ?? "N/A"}`,
        `    - joined_at: ${props.session.customer.member?.created_at ?? "N/A"}`,
        `  - external:`,
        `    - birthday: ${props.session.customer.external_user?.content?.birthYear ?? "N/A"}`,
        `    - gender: ${props.session.customer.external_user?.content?.gender ?? "N/A"},`,
        `    - jobs: ${props.session.customer.external_user?.content?.jobs?.join(", ") ?? "N/A"}`,
        `    - interests: ${props.session.customer.external_user?.content?.interests?.join(", ") ?? "N/A"}`,
        `  - ip: ${props.session.customer.ip}`,
        `  - href: ${props.session.customer.href}`,
        `  - referrer: ${props.session.customer.referrer}`,
        `  - created_at: ${props.session.customer.created_at}`,
        "",
      ];
    })();
    const content: string[] = [
      ...header,
      ...props.messages.map(writeMessage).flat(),
    ];
    return content.join("\n");
  };
}

const writeMessage = (message: IStudioMetaChatSessionMessage): string[] => [
  ...writeMessageHeader(message),
  ...writeMessageData(message),
  ...writeMessageFooter(message),
];

const writeMessageHeader = (
  message: IStudioMetaChatSessionMessage,
): string[] => {
  const output: string[] = [];
  output.push(
    `### ${message.speaker === "user" ? "Human" : "Robot"}`,
    "",
    `  - type: ${message.type}`,
    `  - time: ${new Date(message.created_at).toLocaleString()}`,
    "",
  );
  return output;
};

const writeMessageData = (msg: IStudioMetaChatSessionMessage): string[] => {
  const output: string[] = [];
  if (msg.type === "talk")
    output.push(
      ...msg.arguments[0].text
        .split("\r\n")
        .join("\n")
        .split("\n")
        .map((line) => `> ${line}`),
    );
  else if (msg.type === "completeFunction")
    output.push(
      "> ```json",
      ...JSON.stringify(
        {
          arguments: msg.arguments,
          value: msg.value,
        },
        null,
        2,
      )
        .split("\r\n")
        .join("\n")
        .split("\n")
        .map((str) => `> ${str}`),
      "> ```",
    );
  return output;
};

const writeMessageFooter = (
  _message: IStudioMetaChatSessionMessage,
): string[] => {
  const output: string[] = [];
  // if (message.speaker === "customer") output.push(`</div>`);
  output.push("");
  return output;
};
