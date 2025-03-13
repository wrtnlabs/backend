import { JsonTranslator } from "@samchon/json-translator";
import { OpenApi, OpenApiV3, OpenApiV3_1, SwaggerV2 } from "@samchon/openapi";

import { TranslateService } from "./TranslateService";

export namespace SwaggerTranslateService {
  export interface IProps<
    T extends
      | SwaggerV2.IDocument
      | OpenApiV3.IDocument
      | OpenApiV3_1.IDocument
      | OpenApi.IDocument,
  > {
    document: T;
    language: string;
    dictionary?: Record<string, string> | null | undefined;
  }

  export const translate = <
    T extends
      | SwaggerV2.IDocument
      | OpenApiV3.IDocument
      | OpenApiV3_1.IDocument
      | OpenApi.IDocument,
  >(
    props: IProps<T>,
  ): Promise<T> =>
    TranslateService.api.translate({
      input: props.document,
      target: props.language,
      dictionary: props.dictionary,
      filter,
      source: null,
    });

  export const detect = <
    T extends
      | SwaggerV2.IDocument
      | OpenApiV3.IDocument
      | OpenApiV3_1.IDocument
      | OpenApi.IDocument,
  >(
    props: Omit<IProps<T>, "language">,
  ): Promise<string | undefined> =>
    TranslateService.api.detect({
      input: props.document,
      dictionary: props.dictionary,
      filter,
    });

  export const detectFromText = (text: string): Promise<string | undefined> =>
    TranslateService.api.detect({
      input: text,
    });

  export const dictionary = <
    T extends
      | SwaggerV2.IDocument
      | OpenApiV3.IDocument
      | OpenApiV3_1.IDocument
      | OpenApi.IDocument,
  >(
    input: T,
    output: T,
  ): Record<string, string> =>
    TranslateService.api.dictionary({
      input,
      output,
      filter,
    });

  const filter: Required<JsonTranslator.IProps<any>>["filter"] = (explore) =>
    explore.key === "summary" ||
    explore.key === "title" ||
    explore.key === "description" ||
    explore.key === "termsOfService" ||
    explore.key === "x-wrtn-placeholder";
}
