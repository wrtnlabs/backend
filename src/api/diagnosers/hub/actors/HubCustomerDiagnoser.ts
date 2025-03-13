import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";

export namespace HubCustomerDiagnoser {
  export const invert = (actor: IHubActorEntity) =>
    actor.type === "customer" ? actor : actor.customer;
}
