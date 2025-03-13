import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

import { HubCustomerProvider } from "./HubCustomerProvider";

export namespace HubActorProvider {
  export const equals =
    (x: IHubActorEntity) =>
    (y: IHubActorEntity): boolean =>
      x.type === y.type && x.type === "customer"
        ? HubCustomerProvider.equals(x)(y as IHubCustomer)
        : x.id === y.id;
}
