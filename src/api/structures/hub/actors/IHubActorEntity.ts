import { IHubAdministrator } from "./IHubAdministrator";
import { IHubCustomer } from "./IHubCustomer";
import { IHubSeller } from "./IHubSeller";

export type IHubActorEntity =
  | IHubCustomer
  | IHubSeller.IInvert
  | IHubAdministrator.IInvert;
