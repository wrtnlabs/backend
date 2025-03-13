import { TypedBody } from "@nestia/core";
import { Controller, Post } from "@nestjs/common";
import { OpenApi } from "@samchon/openapi";
import "@wrtnlabs/schema";

import { ITranslate } from "@wrtnlabs/os-api/lib/structures/common/ITranslate";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

import { HubOpenApiTranslateProvider } from "../../../../providers/hub/openapi/HubOpenApiTranslateProvider";

import { SwaggerTranslateService } from "../../../../services/SwaggerTranslateService";
import { IHubControllerProps } from "../IHubControllerProps";

export function HubCommonTranslateController<Actor extends IHubActorEntity>(
  props: IHubControllerProps,
) {
  @Controller(`/hub/${props.path}/commons/translate`)
  class HubCommonTranslateController {
    /**
     * Translate Swagger.
     *
     * Returns a Swagger translated into the desired language.
     *
     * @param input An object containing the Swagger to translate and
     *              the language to translate into
     * @Returns the translated Swagger
     * @tag commons
     * @author Asher
     * @internal
     */
    @Post()
    public translate(
      @props.AuthGuard("member") _actor: Actor,
      @TypedBody() input: ITranslate.IRequest,
    ): Promise<OpenApi.IDocument> {
      return HubOpenApiTranslateProvider.document({
        type: "document",
        document: input.swagger,
        language: input.tarLangType,
      });
    }

    /**
     * Detects language.
     *
     * Detects the language of the input text.
     *
     * @param text The text to detect
     * @return The detected language
     * @tag commons
     * @author Asher
     * @internal
     */
    @Post("/detection")
    async detection(
      @props.AuthGuard("member") _actor: Actor,
      @TypedBody() text: string,
    ): Promise<ITranslate.IDetection[]> {
      const result: string | undefined =
        await SwaggerTranslateService.detectFromText(text);
      return result
        ? [
            {
              language: result,
              input: text,
              confidence: 1,
            },
          ]
        : [];
    }

    /**
     * Translates a Swagger based on a URL.
     *
     * Returns a Swagger translated to the desired language.
     *
     * Translated based on the Customer's language settings.
     *
     * @param input An object containing the URL of the Swagger to translate.
     * @return Translated Swagger
     * @tag commons
     * @author Asher
     * @internal
     */
    @Post("url")
    public async url(
      @props.AuthGuard("member") actor: IHubActorEntity,
      @TypedBody() input: ITranslate.IUrl,
    ): Promise<OpenApi.IDocument> {
      const customer: IHubCustomer.IInvert =
        actor.type === "customer" ? actor : actor.customer;
      return HubOpenApiTranslateProvider.document({
        type: "url",
        url: input.url,
        language: customer.lang_code ?? "en",
      });
    }
  }
  return HubCommonTranslateController;
}
