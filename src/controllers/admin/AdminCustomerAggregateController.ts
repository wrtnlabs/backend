import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { IAdminCustomerAggregate } from "@wrtnlabs/os-api/lib/structures/admin/IAdminCustomerAggregate";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

import { AdminCustomerAggregateProvider } from "../../providers/admin/AdminCustomerAggregateProvider";

import { HubCustomerAuth } from "../../decorators/HubCustomerAuth";

@Controller("admin/aggregate")
export class AdminCustomerAggregateController {
  /**
   * Retrieve all members list.
   *
   * Retrieve all members registered in Ecosystem Members.
   *
   * {@link IHubAdministrator} retrieves all information about {@link IHubMember}.
   *
   * This information includes information about {@link IHubMember} including whether they are Villain & Elite.
   *
   * @param input Page and search request information
   * @author Asher
   * @tag Admin
   */
  @core.TypedRoute.Patch()
  public async index(
    @HubCustomerAuth() actor: IHubCustomer,
    @core.TypedBody() input: IAdminCustomerAggregate.IRequest,
  ): Promise<IPage<IAdminCustomerAggregate.ISummary>> {
    return await AdminCustomerAggregateProvider.index({
      actor,
      input,
    });
  }
}
