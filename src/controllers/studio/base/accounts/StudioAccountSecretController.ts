import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IStudioAccountSecret } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountSecret";

import { StudioAccountSecretProvider } from "../../../../providers/studio/accounts/StudioAccountSecretProvider";

import { IHubControllerProps } from "../../../hub/base/IHubControllerProps";

export function StudioAccountSecretController<Actor extends IHubActorEntity>(
  props: IHubControllerProps,
) {
  @Controller(`studio/${props.path}/accounts/:accountCode/secrets`)
  abstract class StudioAccountSecretController {
    /**
     * Retrieves a list of secret variable sets.
     *
     * All {@link IStudioAccountSecret secret variable set summary information}
     * set in {@link IStudioAccount studio account} are retrieved by
     * {@link IPage paging}.
     *
     * Note that the secret variable sets set in a studio account can only be
     * retrieved by {@link IStudioEnterpriseEmployee employees} who are the owners
     * of the account or have a manager or higher position in the
     * {@link IStudioEnterprise company} that owns the account.
     *
     * @param accountCode {@link IStudioAccount.code} of the account
     * @param input Page and search request information
     * @returns Summary information list of secret variable sets
     * @author Samchon
     * @tag Account
     */
    @core.TypedRoute.Patch()
    public index(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("accountCode") accountCode: string,
      @core.TypedBody() input: IStudioAccountSecret.IRequest,
    ): Promise<IPage<IStudioAccountSecret.ISummary>> {
      return StudioAccountSecretProvider.index({
        actor,
        account: { code: accountCode },
        input,
      });
    }

    /**
     * Gets details of a secret variable set.
     *
     * Gets details of the {@link IStudioAccountSecret secret variable set}
     * set to {@link IStudioAccount studio account}. The returned details include
     * a list of variable values that are not in {@link IStudioAccountSecret.ISummary}
     * and a detailed description.
     *
     * Note that the secret variable set set to a studio account can only be checked
     * by the owner of the account or an {@link IStudioEnterpriseEmployee employee}
     * who has a manager or higher position in the {@link IStudioEnterprise company}
     * that owns the account.
     *
     * @param accountCode {@link IStudioAccount.code} of the account
     * @param id {@link IStudioAccount.id} of the target secret variable set
     * @returns Secret variable details
     * @author Samchon
     * @tag Account
     */
    @core.TypedRoute.Get(":id")
    public at(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("accountCode") accountCode: string,
      @core.TypedParam("id") id: string,
    ): Promise<IStudioAccountSecret> {
      return StudioAccountSecretProvider.at({
        actor,
        account: { code: accountCode },
        id,
      });
    }

    /**
     * Secret variable set details by key.
     *
     * Retrieves the details of the {@link IStudioAccountSecret secret variable}
     * set in the {@link IStudioAccount studio account}, as its key value
     * (variable name). The returned details include variable values and detailed
     * descriptions that are not in {@link IStudioAccountSecret.ISummary}.
     *
     * Note that the secret variables set in the studio account can only be retrieved
     * by the owner of the account or {@link IStudioEnterpriseEmployee employees} who
     * have a manager or higher position in the {@link IStudioEnterprise company} that
     * owns the account.
     *
     * @param accountCode {@link IStudioAccount.code} of the account
     * @param key {@link IStudioAccountSecret.key} of the target secret variable set
     * @returns Secret variable details
     * @author Samchon
     * @tag Account
     */
    @core.TypedRoute.Get(":key/get")
    public get(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("accountCode") accountCode: string,
      @core.TypedParam("key") key: string,
    ): Promise<IStudioAccountSecret> {
      return StudioAccountSecretProvider.get({
        actor,
        account: { code: accountCode },
        key,
      });
    }
  }
  return StudioAccountSecretController;
}
