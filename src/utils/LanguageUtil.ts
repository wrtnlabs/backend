import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

export namespace LanguageUtil {
  export const getActorLangCode = (
    actor: IHubActorEntity,
  ): IHubCustomer["lang_code"] => {
    return actor.type === "customer"
      ? actor.lang_code
      : actor.customer.lang_code;
  };

  export const getLangCode = (
    lang_code: IHubCustomer["lang_code"],
  ): IHubCustomer.LanguageType => {
    return lang_code ?? "en";
  };

  export const getNonNullActorLanguage = (
    actor: IHubActorEntity | null,
  ): IHubCustomer.LanguageType => {
    if (actor === null) return "en";
    const lang_code = getActorLangCode(actor);
    return getLangCode(lang_code);
  };
}
