import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { HubGlobal } from "../../../HubGlobal";
import { ErrorProvider } from "../ErrorProvider";

export namespace SlackProvider {
  export const sendAudit = async (sale: IHubSale) => {
    const RETOOL_URL = HubGlobal.env.RETOOL_URL;
    const categories = sale.categories
      .map((category) => category.name)
      .join(",\n");
    const emails = sale.seller.member.emails
      .map((email) => email.value)
      .join(",\n");
    const date = new Date(sale.created_at);

    const response: Response = await fetch(
      "https://slack.com/api/chat.postMessage",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HubGlobal.env.SLACK_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: "02_eco_앱_심사요청",
          blocks: [
            {
              type: "divider",
            },
            {
              type: "header",
              text: {
                type: "plain_text",
                text: ":star2: 새로운 상품 심사 요청 :star2:",
                emoji: true,
              },
            },
            {
              type: "divider",
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `:package: *상품명:*\n${sale.content.title}`,
                },
                {
                  type: "mrkdwn",
                  text: `:label: *카테고리:*\n${categories}`,
                },
                {
                  type: "mrkdwn",
                  text: `:calendar: *제출일:*\n${date}`,
                },
                {
                  type: "mrkdwn",
                  text: `:bust_in_silhouette: *제출자:*\n${emails}`,
                },
              ],
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `:clipboard: *상세 정보:*\n• 이 상품은 \`${categories}\` 카테고리에 새롭게 등록되었습니다.\n• 제품 설명과 이미지의 일치 여부를 꼭 확인해 주세요.\n`,
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `:link: *상품 링크:*\n<${RETOOL_URL}|:point_right: 여기를 클릭하여 상품 정보 확인하기>`,
              },
            },
            {
              type: "divider",
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: ":pushpin: *검토 시 주의사항:*",
              },
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: "• 상품 정보의 정확성\n• 이미지 품질 및 적절성",
                },
              ],
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: ":female-farmer: *담당 심사자:* <!subteam^S06AS8Y5QAU|ecosystem>",
              },
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: ":alarm_clock: 신속한 검토 부탁드립니다. 궁금한 점이 있으면 이 메시지 스레드에 남겨주세요.",
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw ErrorProvider.internal({
        code: CommonErrorCode.INTERNAL_SERVER_ERROR,
        message: `Slack API 요청 실패 (${await response.text()}`,
      });
    }

    const body = await response.json();

    if (!body.ok) {
      throw ErrorProvider.internal({
        code: CommonErrorCode.INTERNAL_SERVER_ERROR,
        message: `Slack 메시지 전송 실패: ${JSON.stringify(body)}`,
      });
    }
  };
}
