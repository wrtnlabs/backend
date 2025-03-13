import { TypedBody, TypedParam, TypedRoute } from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IStudioAccountSecretValueSandbox } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountSecretValueSandbox";

import { StudioAccountSecretValueSandboxProvider } from "../../../../providers/studio/accounts/StudioAccountSecretValueSandboxProvider";

@Controller("studio/customers/accounts/secrets/values/sandboxes")
export class StudioCustomerAccountSecretValueSandboxController {
  /**
   * Get secret variable value from sandbox.
   *
   * @param id Target secret variable value sandbox record {@link IStudioAccountSecretValueSandbox.id}
   * @author Samchon
   * @tag Account
   */
  @TypedRoute.Get(":id")
  public at(
    @TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<IStudioAccountSecretValueSandbox> {
    return StudioAccountSecretValueSandboxProvider.at(id);
  }

  /**
   * Change secret variable value from sandbox.
   *
   * @param id target secret variable value sandbox record {@link IStudioAccountSecretValueSandbox.id}
   * @param input secret variable value to change
   * @author Samchon
   * @tag Account
   */
  @TypedRoute.Put(":id")
  public update(
    @TypedParam("id") id: string & tags.Format<"uuid">,
    @TypedBody() input: IStudioAccountSecretValueSandbox.IUpdate,
  ): Promise<void> {
    return StudioAccountSecretValueSandboxProvider.update({
      id,
      input,
    });
  }
}
