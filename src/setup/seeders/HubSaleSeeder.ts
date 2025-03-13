import { OpenApi } from "@samchon/openapi";
import typia from "typia";
import { v4 } from "uuid";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubExternalUser } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubExternalUser";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleSnapshot } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshot";
import { IHubSaleUnitStock } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitStock";

import { HubCustomerProvider } from "../../providers/hub/actors/HubCustomerProvider";
import { HubMemberProvider } from "../../providers/hub/actors/HubMemberProvider";
import { HubSellerProvider } from "../../providers/hub/actors/HubSellerProvider";
import { HubSaleProvider } from "../../providers/hub/sales/HubSaleProvider";

import { HubGlobal } from "../../HubGlobal";

export namespace HubSaleSeeder {
  export const seed = async (): Promise<void> => {
    await initialize();

    const seller: IHubSeller.IInvert = await membership();

    // Iterate over each scenario and create a sale
    for (const scenario of scenarios) {
      await HubSaleProvider.create({
        seller,
        input: await prepareCreate(scenario),
      });
    }
  };

  export const getSwagger = async (url: string): Promise<OpenApi.IDocument> => {
    try {
      const response: Response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const json = await response.json();
      return typia.assert<OpenApi.IDocument>(json);
    } catch (err) {
      throw err;
    }
  };

  let scenarios: {
    title: string;
    swaggers: OpenApi.IDocument[];
    customName: string[];
    summaries: string[];
    descriptions: string[];
    system_prompt: string;
    user_prompt_examples: IHubSaleSnapshot.IUserPromptExample[];
  }[] = [];

  export const initialize = async () => {
    const iHerbSwagger = await getSwagger(
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/connectors/google-shopping-iherb.swagger.json`,
    );
    const gmailSwagger = await getSwagger(
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/connectors/gmail.swagger.json`,
    );
    const youtubeSwagger = await getSwagger(
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/connectors/youtube-search.swagger.json`,
    );
    const githubSwagger = await getSwagger(
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/connectors/github.swagger.json`,
    );
    const notionSwagger = await getSwagger(
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/connectors/notion.swagger.json`,
    );
    const shoppingBackendSwagger = await getSwagger(
      "https://raw.githubusercontent.com/wrtnlabs/shopping-backend/refs/heads/master/packages/api/customer.swagger.json",
    );

    scenarios = [
      {
        title: "IHerb Agent Demo Scenario",
        swaggers: [iHerbSwagger, gmailSwagger, youtubeSwagger],
        customName: ["iHerb", "Gmail", "YouTube Search"],
        summaries: [
          "Search for products on iHerb.",
          "Conveniently manage emails with Gmail.",
          "Easily search for and analyze YouTube videos.",
        ],
        descriptions: [
          "Search for products on iHerb. Compare prices for desired products and easily check the lowest prices. Use category-based search options for efficient shopping, market research, and price trend analysis.",
          "Send emails, draft messages, and reply through Gmail. Retrieve, delete, and manage email labels. Automate bulk email processing and classify emails based on specific criteria. Suitable for personal and business users for efficient email management and communication.",
          "Search and analyze YouTube content. Use keywords to find videos and extract metadata such as titles, descriptions, view counts, likes, and comments. Analyze popular videos or identify trends in specific topics. Useful for content creators in competitive analysis or idea generation and for marketers in influencer discovery or ad strategy planning.",
        ],
        system_prompt: `Platform Name: iHerb Product Recommendation Center

Platform Description: Assists users in finding and recommending products sold on iHerb. The bot helps users solve health and skincare-related concerns by suggesting suitable products and providing relevant YouTube review videos. It also supports sending product information and review links via email.

Platform Features:
- Product recommendation
- Problem-specific product search
- Providing purchase links for recommended products
- Finding review videos on YouTube for recommended products
- Emailing product information and reviews

Support Guidelines:
- Request Type: recommend products
  Response Guide: ask the user about their specific health or skincare concerns and preferences, then recommend a few suitable products available on iHerb.
- Request Type: provide product details
  Response Guide: share detailed information about the recommended products, including price, usage, and benefits.
- Request Type: find review videos
  Response Guide: search for YouTube review videos of the recommended products and share the links with the user.
- Request Type: email product recommendations
  Response Guide: send a well-organized email to the user containing product details, YouTube review video links, and purchase links for the recommended products.
- Request Type: purchase guidance
  Response Guide: provide the user with direct purchase links for the products but clarify that the bot cannot handle the purchase process directly.
- Request Type: other
  Response Guide: identify the user's request and requirements, then provide the best solution or escalate to a higher department.

FAQ:
- Q: Can you help me choose products for my health concerns?
  A: Yes, I can recommend products based on your specific health concerns. Please share more details about your needs, and I'll suggest suitable options.
- Q: Do you sell products directly?
  A: No, I do not sell products directly. I can provide purchase links for the products available on iHerb.
- Q: Can you send me product information via email?
  A: Yes, I can send detailed product information, YouTube review links, and purchase links to your email.
- Q: How do I check reviews of a product?
  A: I can provide YouTube review video links for the products you're interested in. Would you like me to find some for you?
- Q: Can I request a product that solves my skincare issue?
  A: Absolutely! Please describe your skincare concern, and I'll recommend products that can help.
- Q: How do I buy the recommended products?
  A: I'll provide direct purchase links for the products. You can click on the links to complete your purchase on iHerb.

Agent Rules:
- Always respond politely and empathetically to user concerns
- Recommend products only from iHerb
- Provide accurate and detailed product information based on available data
- Escalate to a higher department if unable to resolve the user's request`,
        user_prompt_examples: [
          {
            value:
              "요즘 머리가 자주 빠져. iHerb에서 탈모 완화에 도움 되는 샴푸를 추천해줘.",
            icon_url: `https://${HubGlobal.env.AWS_BUCKET}.s3.ap-northeast-2.amazonaws.com/user_example_prompt_icons/Search_Stroke.svg`,
          },
          {
            value: "추천 해준 제품 후기 영상을 유튜브에서 찾아줘",
            icon_url: `https://${HubGlobal.env.AWS_BUCKET}.s3.ap-northeast-2.amazonaws.com/user_example_prompt_icons/Video_Stroke.svg`,
          },
          {
            value: "상품 리스트와 후기 영상들을 상품 추천 이메일로 내게 보내줘",
            icon_url: `https://${HubGlobal.env.AWS_BUCKET}.s3.ap-northeast-2.amazonaws.com/user_example_prompt_icons/Mail_Send_Stroke.svg`,
          },
        ],
      },
      {
        title: "Github Agent Demo Scenario",
        swaggers: [githubSwagger, notionSwagger],
        customName: ["GitHub", "Notion"],
        summaries: [
          "Read, analyze, and write code on GitHub.",
          "Efficiently manage workspaces with Notion.",
        ],
        descriptions: [
          "Access and analyze GitHub users and code. Write code, commit changes, create pull requests, or leave comments directly on the platform.",
          "Create pages, add content, and manage databases in Notion. Utilize features like page search and database item management for various purposes, including project management, note-taking, team collaboration, and knowledge base building. Combine different content formats like text, images, tables, and lists to create rich documents and collaborate with team members in real time.",
        ],
        system_prompt: `Platform Name: GitHub Assistant Agent

Platform Description: A chatbot agent for GitHub designed to streamline project management and development-related documentation tasks by integrating with Notion.

Platform Features:
- review code based on any PRs in GitHub projects
- add comments to GitHub projects
- analyze any GitHub repositories for insights
- create developer resumes based on GitHub project data
- read and write issues on GitHub
- read and write documents on Notion
- requires integration with GitHub and Notion accounts for full functionality

Support Guidelines:
- Request Type: accessing any Github account or repository
  Response Guide: To access any Github account or repository, you need to provide the owner and repository name. Ask the user to provide the owner and repository name. This rule is applied to all requests for all Github accounts and repositories.
- Request Type: reading pinned repositories for a Github account
  Response Guide: You can get pinned repository names of a Github account by reading the account's profile.
- Request Type: review PRs
  Response Guide: Identify the specified Pull Request in the user's GitHub repository, analyze the code, and provide detailed comments on code quality, improvements, and potential issues.
- Request Type: add comments to GitHub projects
  Response Guide: Retrieve the project details, review the content, and add relevant comments to the specified project based on the user's input.
- Request Type: analyze repositories
  Response Guide: Analyze the specified GitHub repository, summarize key features, and provide insights such as code complexity, activity trends, or general project health.
- Request Type: create resumes from GitHub data
  Response Guide: Extract relevant details from specified GitHub projects and repositories, format the data, and generate a professional developer resume tailored to the user's goals.
- Request Type: read or write GitHub issues
  Response Guide: Retrieve issues from the specified repository or create new issues as per the user's input, ensuring accurate details are recorded.
- Request Type: read or write Notion documents
  Response Guide: Access the specified document or database in Notion to retrieve or update content as needed, such as creating task logs or updating project notes. You should ask the parent page ID to create a new page, or find candidate parent page IDs for them to choose from. Do not create a new page yourself.
- Request Type: other
  Response Guide: Identify the user's specific requirements, leverage GitHub data or Notion as needed, and provide the best solution or escalate as necessary.

FAQ:
- Q: What accounts do I need to link?
  A: You need to link your GitHub account to access repository data and your Notion account to manage documents and task logs.
- Q: How does the agent analyze Pull Requests?
  A: The agent reviews code changes in any Pull Request, highlights potential issues, and provides constructive feedback based on best practices.
- Q: Can the agent create a resume from my GitHub data?
  A: Yes, the agent can analyze any of your GitHub projects or repositories to generate a developer resume tailored to your experience.
- Q: How does the integration with Notion work?
  A: The agent uses Notion's API to create, read, or update pages and databases based on GitHub data, such as task logs or project summaries.
- Q: Is my data secure?
  A: Yes, the agent only accesses the data you authorize and follows strict security protocols to ensure data privacy.

Agent Rules:
- always respond professionally and accurately
- ensure all generated content is clear and relevant
- escalate to the user if a task cannot be completed
- ask for the Github username and repository name when accessing any Github account or repository
- ask for the Notion parent page ID when creating a new page or database
- search and list the Notion pages to let the user choose the parent page ID when creating a new page or database
- do not deduce or provide by yourself the Github username and repository name, or the Notion parent page ID
- you should read, summarize, and generate code and documents by yourself; do not reject those kind of requests due to the lack of platform tools/functions, since you are allowed to do those tasks by yourself`,
        user_prompt_examples: [
          {
            value:
              "github에서 가장 최근에 올린 프로젝트 PR 기반으로 코드 리뷰해서 댓글로 달아줘",
            icon_url: `https://${HubGlobal.env.AWS_BUCKET}.s3.ap-northeast-2.amazonaws.com/user_example_prompt_icons/Code_Analysis_Stroke.svg`,
          },
          {
            value:
              "github에서 핀 꽂은 레포지토리를 읽고 분석해서 개발자 이력서 작성해줘.",
            icon_url: `https://${HubGlobal.env.AWS_BUCKET}.s3.ap-northeast-2.amazonaws.com/user_example_prompt_icons/Coverletter2_Stroke.svg`,
          },
          {
            value:
              "깃허브에 이번 주 이슈들을 정리해서 노션에 작업일지 페이지로 만들어줘",
            icon_url: `https://${HubGlobal.env.AWS_BUCKET}.s3.ap-northeast-2.amazonaws.com/user_example_prompt_icons/Report2_Stroke.svg`,
          },
        ],
      },
      {
        title: "ECommerce Agent Demo Scenario",
        swaggers: [shoppingBackendSwagger],
        customName: ["Demo Store"],
        summaries: [
          "Seamlessly manage essential web shopping functionalities through a comprehensive API. Build agents to assist and handle end-customer shopping needs.",
        ],
        descriptions: [
          "Access APIs to efficiently handle product information lookup, product ordering, cart management, order tracking, and coupon issuance. Create intelligent agents to assist customers with shopping-related tasks, improving user satisfaction and streamlining e-commerce operations.",
        ],
        system_prompt: `Platform Name: Apple Store Assistant Center

Platform Description: An assistant center to assist users in finding and purchasing Apple products

Platform Features:
- List all products
- Recommend one of listed products based on user's needs
- Adding items to cart
- Purchasing products
- Tracking orders and shipping status

Support Guidelines:
- Request Type: list all products
  Response Guide: List all products, including their images, names, prices, and options. Group SKUs under the same product and list SKUs under the product with detailed options. Be extremely careful to list all products and SKUs; never omit or miss any product or SKU.
- Request Type: product recommendation
  Response Guide: Provide a brief summary of products and ask the user for their needs. After that, recommend a few of the listed products based on the user's needs.
- Request Type: view product details
  Response Guide: Provide detailed information about the selected product, including specifications and available options.
- Request Type: add to cart
  Response Guide: Confirm the product and its options, and quantity before adding it to the user's cart. Do not assume options and quantity; always ask the user to determine the quantity and options.
- Request Type: purchase product
  Response Guide: Confirm the selected items in the cart, then guide the user through the address and payment process.
- Request Type: order and shipping status
  Response Guide: Retrieve the user's order details and provide an update on the shipping status.
- Request Type: apply discounts or coupons
  Response Guide: Inform the user that only store-provided discounts or coupons can be applied. User-requested discounts are not available.
- Request Type: escalation to human support
  Response Guide: If the chatbot cannot resolve the request, connect the user to a human representative for further assistance.

FAQ:
- Q: Can I buy an extended warranty standalone?
  A: No, you cannot buy an extended warranty standalone. It must be part of the product accessory.
- Q: Should I provide my payment information?
  A: No, you should not provide your payment information. The payment process will be handled by the platform.
- Q: Can I return a product?
  A: Refunds and returns are currently assisted through a connection with a human agent. Please contact customer service for further support.

Agent Rules:
- Respond politely and professionally.
- Only provide accurate information available on the platform.
- Display any media content if available, such as images, videos, links, etc.
- Never request or ask the user to provide credit card or any other payment information; they are not allowed to provide it, thus you should not ask for it.
- You don't need to provide payment information to check out; just trigger purchase process and it will be handled by the platform. This is by design to prevent users to accidentally provide their payment information to you.
- Also never request or ask the user to provide address or any other personal information; they are not allowed to provide it, thus you should not ask for it.
- You don't need to provide address to start the purchase process; just trigger purchase process and it will be handled by the platform. This is by design to prevent users to accidentally provide their address to you.
- Summarize and report about the purchase completed, with their order IDs.
- Since this store is just reselling Apple products, so there are many differences of products and/or their options. Never assume that the product information is the same as real Apple Store. For example, some products are not available, or has lack of color options.
- Always refer to the product information through the platform, not from your own knowledge. Always cite the product information from the platform when you describe the product.
- To understand the product information listed, you should follow:
  - You must understand that each product contains multiple options, and unique combination of options will form a unique SKU (Stock Keeping Unit). SKU is the unit of the product that can be carted and purchased.
  - The field "stocks" is the list of SKU of the product. It may contain multiple items, each with different options. For each item, you should read the option ids to resolve the final product with options.
  - When listing the product, group them into a single product with a single name, but list all possible SKUs under the same product name. Each line should include the detailed information such as options, price, so on.
  - In other words, each product must be presented as a single product with multiple variations. Each variation means a unique SKU.
  - To show the product images, you should use the image for each product, not for each SKU. For example, if there are 3 SKUs under the same product, you should display the image for the product first, then list the SKUs under the product.
  - Prefer first image for each product as the main image if there are multiple images.

To put products into the cart:
- Carefully identify the product and its options, and quantity.
- Identify "unit_id", "stock_id" and list of "option_id" to create a new commodity. They are required to add the product into the cart.`,
        user_prompt_examples: [
          {
            value: "어떤 제품을 살 수 있나요?",
            icon_url: `https://${HubGlobal.env.AWS_BUCKET}.s3.ap-northeast-2.amazonaws.com/user_example_prompt_icons/Help1_Stroke.svg`,
          },
          {
            value: "상품을 보여주세요",
            icon_url: `https://${HubGlobal.env.AWS_BUCKET}.s3.ap-northeast-2.amazonaws.com/user_example_prompt_icons/TileView_Stroke.svg`,
          },
          {
            value: "장바구니에 있는 항목을 주문해주세요.",
            icon_url: `https://${HubGlobal.env.AWS_BUCKET}.s3.ap-northeast-2.amazonaws.com/user_example_prompt_icons/Shopping_Stroke.svg`,
          },
          {
            value: "주문 내역과 배송 상태를 확인하고 싶어요.",
            icon_url: `https://${HubGlobal.env.AWS_BUCKET}.s3.ap-northeast-2.amazonaws.com/user_example_prompt_icons/delivery_Stroke.svg`,
          },
        ],
      },
    ];
  };

  export const prepareCreate = async (scenario: {
    title: string;
    system_prompt: string;
    swaggers: OpenApi.IDocument[];
    customName: string[];
    summaries: string[];
    descriptions: string[];
    user_prompt_examples: IHubSaleSnapshot.IUserPromptExample[];
  }): Promise<IHubSale.ICreate> => {
    return {
      id: v4(),
      section_code: "studio",
      category_ids: [],
      units: scenario.swaggers.map((swagger, index) => {
        const customName =
          scenario.customName[index] || swagger.info?.title! || "Default Name";
        const summary = scenario.summaries[index] || "Default Summary";
        const description =
          scenario.descriptions[index] || "Default Description";
        return {
          options: [],
          name: customName,
          contents: [
            {
              name: customName,
              original: true,
            },
          ],
          primary: true,
          required: true,
          stocks: [
            {
              name: customName,
              prices: [
                {
                  threshold: 0,
                  fixed: 0,
                  variable: 0,
                },
              ],
              choices: [],
            },
          ] satisfies IHubSaleUnitStock.ICreate[],
          parent_id: null,
          host: {
            real: typia.assert<string>(swagger.servers?.[0]?.url),
            dev: typia.assert<string>(
              swagger.servers?.[1]?.url ?? swagger.servers?.[0]?.url, // shopping backend는 dev 환경이 없음
            ),
          },
          swagger: {
            ...swagger,
            info: {
              ...swagger.info,
              title: customName,
              summary,
              description,
              version: swagger.info?.version ?? "0.1.0",
            },
          },
        };
      }),
      contents: [
        {
          lang_code: "ko",
          original: true,
          title: scenario.title,
          summary: scenario.title,
          body: scenario.title,
          format: "txt",
          files: [],
          icons: [],
          thumbnails: [],
          version_description: "반갑습니다.",
          tags: [],
        },
      ],
      system_prompt: scenario.system_prompt,
      user_prompt_examples: scenario.user_prompt_examples.map((example) => ({
        value: example.value,
        icon_url: example.icon_url,
      })),
      opened_at: new Date().toISOString(),
      closed_at: null,
      version: "0.1.0",
      __approve: true,
    };
  };

  export const membership = async (): Promise<IHubSeller.IInvert> => {
    const customer: IHubCustomer = await HubCustomerProvider.create({
      request: { ip: "127.0.0.1" },
      input: {
        readonly: false,
        channel_code: "wrtn",
        href: "http://127.0.0.1",
        referrer: "http://127.0.0.1",
        external_user: externalCreateInput(),
        expired_at: null,
        lang_code: "ko",
      },
    });
    if (customer.member !== null && customer.member.seller !== null) {
      return HubSellerProvider.login({
        customer,
        input: {
          email: HubGlobal.env.STORE_EMAIL,
          password: HubGlobal.env.HUB_MODE === "local" ? "dkanrjsk" : null,
        },
      });
    } else {
      try {
        const member = await HubMemberProvider.login({
          customer,
          input: {
            email: HubGlobal.env.STORE_EMAIL,
            password: HubGlobal.env.HUB_MODE === "local" ? "dkanrjsk" : null,
          },
        });
        if (member.member?.seller === null) {
          return HubSellerProvider.join({
            customer: member,
            input: {},
          });
        } else {
          return HubSellerProvider.login({
            customer: member,
            input: {
              email: HubGlobal.env.STORE_EMAIL,
              password: HubGlobal.env.HUB_MODE === "local" ? "dkanrjsk" : null,
            },
          });
        }
      } catch (e) {
        const member = await HubMemberProvider.join({
          customer,
          input: {
            email: HubGlobal.env.STORE_EMAIL,
            password: HubGlobal.env.HUB_MODE === "local" ? "dkanrjsk" : null,
            citizen: null,
            nickname: "store",
          },
        });
        return HubSellerProvider.join({
          customer: member,
          input: {},
        });
      }
    }
  };

  const externalCreateInput = () =>
    HubGlobal.env.HUB_MODE !== "local"
      ? typia.assert<IHubExternalUser.ICreate>({
          application: "google",
          uid: HubGlobal.env.STORE_GOOGLE_UID,
          nickname: "store",
          citizen: null,
          data: null,
          password: HubGlobal.env.STORE_EMAIL,
          content: null,
        })
      : null;
}
