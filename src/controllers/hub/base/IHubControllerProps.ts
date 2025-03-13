import { ActorPath } from "../../../api/typings/ActorPath";

export interface IHubControllerProps<Path extends ActorPath = ActorPath> {
  AuthGuard: (customerLevel?: "member" | "citizen") => ParameterDecorator;
  path: Path;
}
