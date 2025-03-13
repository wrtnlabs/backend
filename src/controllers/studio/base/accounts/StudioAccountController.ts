import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IStudioAccount } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccount";

import { StudioAccountProvider } from "../../../../providers/studio/accounts/StudioAccountProvider";

import { IHubControllerProps } from "../../../hub/base/IHubControllerProps";

export function StudioAccountController<Actor extends IHubActorEntity>(
  props: IHubControllerProps,
) {
  @Controller(`studio/${props.path}/accounts`)
  class StudioAccountController {
    /**
     * Retrieve the list of account summary information.
     *
     * All {@link IStudioAccount.IInvert account summary information} existing
     * in this studio system {@link IPage paging processing} is retrieved.
     *
     * @param input Page and search request information
     * @returns List of paging accounts
     * @author Samchon
     * @tag Account
     */
    @core.TypedRoute.Patch()
    public async index(
      @props.AuthGuard() _actor: Actor,
      @core.TypedBody() input: IStudioAccount.IRequest,
    ): Promise<IPage<IStudioAccount.ISummary>> {
      return StudioAccountProvider.index(input);
    }

    /**
     * Retrieve account details with {@link IStudioAccount.id}.
     *
     * @param id {@link IStudioAccount.id} of target account
     * @returns account information
     * @author Samchon
     * @tag Account
     */
    @core.TypedRoute.Get(":id")
    public async at(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IStudioAccount> {
      actor;
      return StudioAccountProvider.at({
        actor,
        id,
      });
    }

    /**
     * Retrieve account details with {@link IStudioAccount.code}.
     *
     * @param code {@link IStudioAccount.code} of target account
     * @returns account information
     * @author Samchon
     * @tag Account
     */
    @core.TypedRoute.Get(":code/get")
    public async get(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("code") code: string,
    ): Promise<IStudioAccount> {
      return StudioAccountProvider.get({
        actor,
        code,
      });
    }
  }

  return StudioAccountController;
}
