import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubMemberElite } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMemberElite";
import { IHubMemberVillain } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMemberVillain";

import { AdminCustomerAccessProvider } from "../../providers/admin/AdminCustomerAccessProvider";

import { HubCustomerAuth } from "../../decorators/HubCustomerAuth";

@Controller("admin/access")
export class AdminCustomerAccessController {
  /**
   * Promote a specific member to Elite privileges.
   *
   * Promote a specific {@link IHubMember} to {@link IHubMemberElite}.
   *
   * @param input Elite promotion information
   * @return Promoted member information
   * @author Asher
   * @tag Admin
   */
  @core.TypedRoute.Post("elite")
  async createElite(
    @HubCustomerAuth() actor: IHubCustomer,
    @core.TypedBody() input: IHubMemberElite.ICreate,
  ): Promise<IHubMemberElite> {
    return AdminCustomerAccessProvider.elite.create({
      actor,
      input,
    });
  }

  /**
   * Remove Elite privileges for a specific member
   *
   * Remove Elite privileges for a specific {@link IHubMember}.
   * This does not actually delete the privileges, but leaves a snapshot of the privileges being removed.
   *
   * @param id specific {@link IHubMember.id}
   * @author Asher
   * @tag Admin
   */
  @core.TypedRoute.Delete("elite/:id")
  async eraseElite(
    @HubCustomerAuth() actor: IHubCustomer,
    @core.TypedParam("id") id: string,
  ) {
    await AdminCustomerAccessProvider.elite.erase({
      actor,
      id,
    });
  }

  /**
   * Demote a specific member to a Villain member
   *
   * Demotes a specific {@link IHubMember} to {@link IHubMemberVillain}.
   *
   * @param input Villain demotion information
   * @return Demoted member information
   * @author Asher
   * @tag Admin
   */
  @core.TypedRoute.Post("villain")
  async createVillain(
    @HubCustomerAuth() actor: IHubCustomer,
    @core.TypedBody() input: IHubMemberVillain.ICreate,
  ): Promise<IHubMemberVillain> {
    return AdminCustomerAccessProvider.villain.create({
      actor,
      input,
    });
  }

  /**
   * Remove Villain privileges of a specific member
   *
   * Remove Villain privileges of a specific {@link IHubMember}.
   * It does not actually delete, but leaves a snapshot of the privileges being lowered.
   *
   * @param id specific {@link IHubMember.id}
   * @author Asher
   * @tag Admin
   */
  @core.TypedRoute.Delete("villain/:id")
  async eraseVillain(
    @HubCustomerAuth() actor: IHubCustomer,
    @core.TypedParam("id") id: string,
  ) {
    await AdminCustomerAccessProvider.villain.erase({
      actor,
      id,
    });
  }
}
