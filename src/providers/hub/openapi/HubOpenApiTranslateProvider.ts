import { BadRequestException } from "@nestjs/common";
import { OpenApi, OpenApiV3, OpenApiV3_1, SwaggerV2 } from "@samchon/openapi";
import fs from "fs";
import { Singleton } from "tstl";
import typia, { TypeGuardError } from "typia";
import { v4 } from "uuid";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { ISwaggerTranslation } from "@wrtnlabs/os-api/lib/structures/openapi/ISwaggerTranslation";

import { HubConfiguration } from "../../../HubConfiguration";
import { HubGlobal } from "../../../HubGlobal";
import { SwaggerTranslateService } from "../../../services/SwaggerTranslateService";
import { S3Util } from "../../../utils/S3Util";
import { ErrorProvider } from "../../common/ErrorProvider";

export namespace HubOpenApiTranslateProvider {
  /* -----------------------------------------------------------
    FACADE FUNCTIONS
  ----------------------------------------------------------- */
  export const document = async (
    input: ISwaggerTranslation.IRequest,
  ): Promise<OpenApi.IDocument> => {
    if (input.type === "document") {
      const document: OpenApi.IDocument = OpenApi.convert(input.document);
      return SwaggerTranslateService.translate({
        document,
        language: input.language,
      });
    }
    const { document } = await emplace(input);
    return document();
  };

  export const url = async (
    input: ISwaggerTranslation.IUrlRequest,
  ): Promise<ISwaggerTranslation> => {
    const result: IEmplaceOutput = await emplace(input);
    return {
      url: result.url,
      language: result.language,
    };
  };

  /* -----------------------------------------------------------
    EMPLACER
  ----------------------------------------------------------- */
  interface IEmplaceOutput {
    url: string;
    language: string;
    document: () => Promise<OpenApi.IDocument>;
  }

  const emplace = async (
    input: ISwaggerTranslation.IUrlRequest,
  ): Promise<IEmplaceOutput> => {
    // FIND MATCHED DOCUMENT
    const document: OpenApi.IDocument = await fetchSwagger(input.url);
    const source =
      await HubGlobal.prisma.hub_external_swagger_documents.findFirst({
        where: {
          src_url: input.url,
          version: document.info?.version ?? "0.1.0",
        },
        include: {
          to_translates: true,
        },
      });
    if (source === null)
      return createExternalSwaggerDocument({
        language: input.language,
        url: input.url,
        document,
      });

    // ALREADY TRANSLATED
    const matched = source.to_translates.find(
      (t) => t.lang_code === input.language,
    );
    if (matched)
      return {
        language: matched.lang_code ?? "en",
        url: matched.url,
        document: () => fetchSwagger(matched.url),
      };

    // NEW TRANSLATION
    return translateExternalSwaggerDocument({
      document,
      source,
      language: input.language,
      url: input.url,
    });
  };

  const createExternalSwaggerDocument = async (input: {
    url: string;
    document: OpenApi.IDocument;
    language: string;
  }): Promise<IEmplaceOutput> => {
    const from: string =
      (await SwaggerTranslateService.detect({
        document: input.document,
      })) ?? "en";
    const original: IEmplaceOutput = {
      language: from,
      url: input.url,
      document: async () => input.document,
    };
    const translated: IEmplaceOutput | null = await (async () => {
      if (input.language === from) return null;
      const document: OpenApi.IDocument =
        await SwaggerTranslateService.translate({
          language: input.language,
          document: input.document,
        });
      return {
        language: input.language,
        url: await uploadSwagger({
          document,
          language: input.language,
        }),
        document: async () => document,
      };
    })();

    const record = await HubGlobal.prisma.hub_external_swagger_documents.upsert(
      {
        where: {
          src_url_version: {
            src_url: input.url,
            version: input.document.info?.version ?? "0.1.0",
          },
        },
        create: {
          id: v4(),
          src_url: input.url,
          version: input.document.info?.version ?? "0.1.0",
          created_at: new Date(),
        },
        update: {},
      },
    );
    await createExternalSwaggerDocumentTranslate({
      source: record,
      language: original.language,
      original: true,
      url: original.url,
    });
    if (translated !== null)
      await createExternalSwaggerDocumentTranslate({
        source: record,
        language: translated.language,
        original: false,
        url: translated.url,
      });
    return translated ?? original;
  };

  const createExternalSwaggerDocumentTranslate = async (props: {
    source: IEntity;
    original: boolean;
    url: string;
    language: string;
  }): Promise<void> => {
    await HubGlobal.prisma.hub_external_swagger_document_translates.upsert({
      where: {
        hub_external_swagger_document_id_lang_code: {
          hub_external_swagger_document_id: props.source.id,
          lang_code: props.language,
        },
      },
      create: {
        id: v4(),
        hub_external_swagger_document_id: props.source.id,
        original: props.original,
        lang_code: props.language,
        url: props.url,
      },
      update: {
        original: props.original,
        url: props.url,
      },
    });
  };

  const translateExternalSwaggerDocument = async (props: {
    url: string;
    document: OpenApi.IDocument;
    language: string;
    source: IEntity;
  }): Promise<IEmplaceOutput> => {
    const previous =
      await HubGlobal.prisma.hub_external_swagger_document_translates.findFirst(
        {
          where: {
            lang_code: props.language,
            swagger: {
              src_url: props.url,
            },
          },
        },
      );
    const dictionary: Record<string, string> =
      previous === null
        ? {}
        : SwaggerTranslateService.dictionary(
            props.document,
            await fetchSwagger(previous.url),
          );
    const translated: OpenApi.IDocument =
      await SwaggerTranslateService.translate({
        document: props.document,
        language: props.language,
        dictionary,
      });
    const url: string = await uploadSwagger({
      document: translated,
      language: props.language,
    });
    await HubGlobal.prisma.hub_external_swagger_document_translates.upsert({
      where: {
        hub_external_swagger_document_id_lang_code: {
          hub_external_swagger_document_id: props.source.id,
          lang_code: props.language,
        },
      },
      create: {
        id: v4(),
        hub_external_swagger_document_id: props.source.id,
        lang_code: props.language,
        original: false,
        url,
      },
      update: {
        url,
        original: false,
      },
    });
    return {
      url,
      language: props.language,
      document: async () => translated,
    };
  };
}

const prepareDirectory = new Singleton(async () => {
  await fs.promises.mkdir(`${HubConfiguration.ROOT}/packages/public/swaggers`, {
    recursive: true,
  });
  return `${HubConfiguration.ROOT}/packages/public/swaggers`;
});

const fetchSwagger = async (url: string): Promise<OpenApi.IDocument> => {
  const response: Response = await fetch(url);
  if (!response.ok) {
    throw ErrorProvider.http(response.status)({
      code: CommonErrorCode.EXTERNAL_SWAGGER_URL_ERROR,
      message: `${await response.text()}`,
    });
  }
  const document:
    | SwaggerV2.IDocument
    | OpenApiV3.IDocument
    | OpenApiV3_1.IDocument
    | OpenApi.IDocument = await response.json();
  try {
    typia.assert(document);
  } catch (exp) {
    if (typia.is<TypeGuardError>(exp))
      throw new BadRequestException({
        path: exp.path,
        reason: exp.message,
        expected: exp.expected,
        value: exp.value,
        message: "Invalid Swagger document",
      });
    throw exp;
  }
  return OpenApi.convert(document);
};

const uploadSwagger = async (props: {
  language: string;
  document: OpenApi.IDocument;
}): Promise<string> => {
  if (HubGlobal.testing === true) {
    const file: string = `${v4()}.json`;
    await fs.promises.writeFile(
      `${await prepareDirectory.get()}/${file}`,
      JSON.stringify(props.document),
      "utf8",
    );
    return `${HubConfiguration.API_HOST()}/public/swaggers/${file}`;
  }
  return await S3Util.putObject({
    path: `/hub/swaggers/${props.language ?? "none"}/${v4()}`,
    type: "application/json",
    body: JSON.stringify(props.document),
  });
};
