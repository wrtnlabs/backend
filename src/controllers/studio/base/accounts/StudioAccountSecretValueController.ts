import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IStudioAccountSecretValue } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountSecretValue";

import { StudioAccountSecretValueProvider } from "../../../../providers/studio/accounts/StudioAccountSecretValueProvider";

import { IHubControllerProps } from "../../../hub/base/IHubControllerProps";

export function StudioAccountSecretValueController<
  Actor extends IHubActorEntity,
>(props: IHubControllerProps) {
  @Controller(`studio/${props.path}/accounts/:accountCode/secrets`)
  class StudioAccountSecretValueController {
    /**
     * Retrieve a list of global variables.
     *
     * @param accountCode {@link IStudioAccount.code} of the account to which it belongs
     * @param input Page and search request information
     * @returns List of summary information on dereferenced variable values
     *
     * @author Samchon
     * @tag Account
     */
    @core.TypedRoute.Patch("values")
    public index(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("accountCode") accountCode: string,
      @core.TypedBody() input: IStudioAccountSecretValue.IRequest,
    ): Promise<IPage<IStudioAccountSecretValue.IInvertSummary>> {
      return StudioAccountSecretValueProvider.index({
        actor,
        account: { code: accountCode },
        input,
      });
    }

    /**
     * Global variable details.
     *
     * @param accountCode {@link IStudioAccount.code} of the account to which it belongs
     * @param secretId {@link IStudioAccountSecret.id} of the set of secret variables to which it belongs
     * @param id {@link IStudioAccountSecretValue.id} of the target variable value
     * @returns Variable value details
     *
     * @author Samchon
     * @tag Account
     */
    @core.TypedRoute.Get(":secretId/values/:id")
    public at(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("accountCode") accountCode: string,
      @core.TypedParam("secretId") secretId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IStudioAccountSecretValue> {
      return StudioAccountSecretValueProvider.at({
        actor,
        account: { code: accountCode },
        secret: { id: secretId },
        id,
      });
    }
  }
  return StudioAccountSecretValueController;
}
