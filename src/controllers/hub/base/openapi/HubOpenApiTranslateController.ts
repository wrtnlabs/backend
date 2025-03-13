import { TypedBody } from "@nestia/core";
import { Controller, Post } from "@nestjs/common";
import { OpenApi } from "@samchon/openapi";
import "@wrtnlabs/schema";

import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { ISwaggerTranslation } from "@wrtnlabs/os-api/lib/structures/openapi/ISwaggerTranslation";

import { HubOpenApiTranslateProvider } from "../../../../providers/hub/openapi/HubOpenApiTranslateProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubOpenApiTranslateController(props: IHubControllerProps) {
  @Controller(`/hub/${props.path}/openapi/translate`)
  class HubOpenApiTranslateController {
    /**
     * Translate Swagger Document.
     *
     * Translate Swagger document into the desired language.
     *
     * You can request the translation with the Swagger document or
     * its containing URL.
     *
     * @param input Request of the Swagger or its URL to translate
     * @returns Translated Swagger
     */
    @Post("document")
    public document(
      _actor: IHubActorEntity,
      @TypedBody() input: ISwaggerTranslation.IRequest,
    ): Promise<OpenApi.IDocument> {
      return HubOpenApiTranslateProvider.document(input);
    }

    /**
     * Translate Swagger and get URL of the translated.
     *
     * Translate Swagger document into the desired language from URL address,
     * and get the URL of the translated Swagger.
     *
     * @param input Request of the URL to translate
     * @returns URL containing the translated Swagger
     * @tag OpenAPI
     * @author Samchon
     */
    @Post("url")
    public url(
      _actor: IHubActorEntity,
      @TypedBody() input: ISwaggerTranslation.IUrlRequest,
    ): Promise<ISwaggerTranslation> {
      return HubOpenApiTranslateProvider.url(input);
    }
  }
  return HubOpenApiTranslateController;
}
