import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import typia from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubAuthenticateKey } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAuthenticateKey";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

import { HubAuthenticateProvider } from "../../../../providers/hub/actors/HubAuthenticateProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";

@Controller("hub/customers/authenticate/keys")
export class HubCustomerAuthenticateKeyController {
  /**
   * List of personal API access keys.
   *
   * Retrieves the list of personal API access keys issued to registered
   * customer members.
   *
   * @param input Search information
   * @return Search results
   * @author Asher
   * @tag Authenticate
   */
  @core.TypedRoute.Patch()
  index(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubAuthenticateKey.ISearch,
  ): Promise<IPage<IHubAuthenticateKey>> {
    return HubAuthenticateProvider.index({
      customer,
      input,
    });
  }

  /**
   * Disable Personal API Access Key.
   *
   * Disables the Personal API Access Key issued to a registered customer.
   *
   * @param id Personal API Access Key {@link IHubAuthenticateKey.id}
   * @return void
   * @author Asher
   * @tag Authenticate
   */
  @core.TypedRoute.Delete("/:id")
  deprecated(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("id") id: string & typia.tags.Format<"uuid">,
  ): Promise<void> {
    return HubAuthenticateProvider.deprecate({
      customer,
      id,
    });
  }

  /**
   * Issue a personal API access key.
   *
   * A registered customer receives a personal API access key.
   *
   * @param input Issue information
   * @return Issued personal API access key
   * @author Asher
   * @tag Authenticate
   */
  @core.TypedRoute.Post()
  create(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubAuthenticateKey.ICreate,
  ): Promise<IHubAuthenticateKey> {
    return HubAuthenticateProvider.create({
      customer,
      input,
    });
  }

  /**
   * Retrieve personal API access key.
   *
   * @param id personal API access key {@link IHubAuthenticateKey.id}
   * @return Retrieved personal API access key information
   * @author Asher
   * @tag Authenticate
   */
  @core.TypedRoute.Get("/:id")
  at(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("id") id: string & typia.tags.Format<"uuid">,
  ): Promise<IHubAuthenticateKey> {
    return HubAuthenticateProvider.at({
      customer,
      id,
    });
  }
}
