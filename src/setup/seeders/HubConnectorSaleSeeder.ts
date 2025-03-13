import {
  HttpMigration,
  IHttpMigrateApplication,
  OpenApi,
} from "@samchon/openapi";
import "@wrtnlabs/schema";
import { Singleton } from "tstl";
import typia, { tags } from "typia";
import { v4 } from "uuid";

import { IAttachmentFile } from "@wrtnlabs/os-api/lib/structures/common/IAttachmentFile";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubExternalUser } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubExternalUser";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleContent } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleContent";
import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";
import { IHubSaleUnitStock } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitStock";

import { HubCustomerProvider } from "../../providers/hub/actors/HubCustomerProvider";
import { HubMemberProvider } from "../../providers/hub/actors/HubMemberProvider";
import { HubSellerProvider } from "../../providers/hub/actors/HubSellerProvider";
import { HubSaleProvider } from "../../providers/hub/sales/HubSaleProvider";

import { HubGlobal } from "../../HubGlobal";
import { ConnectorContentAsset } from "./assets/ConnectorContentAsset";

interface IMetadata {
  content: IHubSaleContent.ICreate;
  categories: Array<string & tags.Format<"uuid">> & tags.UniqueItems;
}

export namespace HubConnectorSaleSeeder {
  export const createOrUpdate = async (
    swaggerList: OpenApi.IDocument[],
  ): Promise<void> => {
    const seller = await membership();

    await Promise.all(
      swaggerList.map(async (swagger) => {
        const sale = await HubGlobal.prisma.hub_sales.findFirst({
          where: {
            snapshots: {
              some: { contents: { some: { title: swagger.info?.title } } },
            },
            member: {
              emails: { some: { value: seller.member.emails[0].value } },
            },
          },
          include: {
            mv_last: {
              include: {
                last: { include: { units: { select: { id: true } } } },
              },
            },
          },
        });

        if (sale === null) {
          await HubSaleProvider.create({
            seller,
            input: await prepareCreate(swagger),
          });
        } else if (swagger.info?.version !== sale.mv_last?.last.version) {
          await HubSaleProvider.update({
            seller,
            id: sale.id,
            input: await prepareUpdate(sale.mv_last!.last.units[0], swagger),
          });
        }
      }),
    );
  };
  export const prepareCreate = async (
    swagger: OpenApi.IDocument,
  ): Promise<IHubSale.ICreate> => {
    const title: string = typia.assert<string>(swagger.info?.title);
    const metadata = await prepareMetadata(swagger, title);

    return {
      id: v4(),
      section_code: "studio",
      category_ids: metadata.categories,
      system_prompt: null,
      user_prompt_examples: [],
      units: [
        {
          options: [],
          contents: [{ name: title, original: true }],
          primary: true,
          required: true,
          stocks: [
            {
              name: title,
              prices: [{ threshold: 0, fixed: 0, variable: 0 }],
              choices: [],
            },
          ] satisfies IHubSaleUnitStock.ICreate[],
          parent_id: null,
          host: {
            real: typia.assert<string>(swagger.servers?.[0]?.url),
            dev: typia.assert<string>(swagger.servers?.[1]?.url),
          },
          swagger,
        } satisfies IHubSaleUnit.ICreate,
      ],
      contents: [metadata.content],
      opened_at: new Date().toISOString(),
      closed_at: null,
      version: swagger.info?.version ?? "0.1.0",
      __approve: true,
    };
  };

  export const prepareUpdate = async (
    unit: IEntity,
    swagger: OpenApi.IDocument,
  ): Promise<IHubSale.IUpdate> => {
    const update: IHubSale.IUpdate = await prepareCreate(swagger);
    update.units[0].parent_id = unit.id;
    return update;
  };

  export const getSwagger = async (): Promise<OpenApi.IDocument> => {
    const response: Response = await fetch(
      "https://wrtnlabs.github.io/connectors/swagger/swagger.json",
      { method: "GET", headers: { "Content-Type": "application/json" } },
    );
    const json = await response.json();
    return typia.assert<OpenApi.IDocument>(json);
  };

  const prepareMetadata = async (
    swagger: OpenApi.IDocument,
    title: string,
  ): Promise<IMetadata> => {
    const migrate: IHttpMigrateApplication = HttpMigration.application(swagger);

    const icons: [] | IAttachmentFile.ICreate[] =
      migrate.routes[0]?.operation()?.["x-wrtn-icon"] !== undefined
        ? [
            {
              url: migrate.routes[0].operation()["x-wrtn-icon"]!,
              name: "icon",
              extension: "svg",
            } satisfies IAttachmentFile.ICreate,
          ]
        : [];

    const thumbnails = ConnectorContentAsset.thumbnail[swagger.info?.title!];

    return {
      categories: await prepareCategories(swagger),
      content: {
        lang_code: "en",
        original: true,
        title: title,
        summary: swagger.info?.summary ?? "",
        body: swagger.info?.description ?? "",
        format: "txt",
        files: [],
        icons: icons,
        thumbnails:
          thumbnails?.map(
            (url) =>
              ({
                url: url,
                name: "thumbnail",
                extension: url.split(".").pop() ?? null,
              }) satisfies IAttachmentFile.ICreate,
          ) ?? [],
        version_description: `${swagger.info?.version ?? "0.1.0"} update`,
        tags: [],
      } satisfies IHubSaleContent.ICreate,
    };
  };

  const prepareCategories = async (
    swagger: OpenApi.IDocument,
  ): Promise<string[]> => {
    const categoryNames = ConnectorContentAsset.category[
      swagger.info?.title!
    ] || ["생산성"];

    const allCategories = await categories.get();

    return categoryNames
      .map(
        (name) =>
          allCategories.find((cat) =>
            cat.names.some((n) => n.lang_code === "ko" && n.name === name),
          )?.id,
      )
      .filter((id) => id != null);
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
          return HubSellerProvider.join({ customer: member, input: {} });
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
            nickname: "studio",
          },
        });
        return HubSellerProvider.join({ customer: member, input: {} });
      }
    }
  };

  const externalCreateInput = () =>
    HubGlobal.env.HUB_MODE !== "local"
      ? typia.assert<IHubExternalUser.ICreate>({
          application: "google",
          uid: HubGlobal.env.STUDIO_GOOGLE_UID,
          nickname: "studio",
          citizen: null,
          data: null,
          password: HubGlobal.env.STORE_EMAIL,
          content: null,
        })
      : null;

  const categories = new Singleton(async () => {
    return HubGlobal.prisma.hub_channel_categories.findMany({
      include: { names: true },
    });
  });
}
