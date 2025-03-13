import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import typia from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSection } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubSection";

import { HubSectionProvider } from "../../../../providers/hub/systematic/HubSectionProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubSystematicSectionController(props: IHubControllerProps) {
  @Controller(`hub/${props.path}/systematic/sections`)
  class HubSystematicSectionController {
    /**
     * List of section information.
     *
     * Retrieves a list of {@link IHubSection}.
     *
     * The returned {@link IHubSection}s are {@link IPage paging} processed.
     *
     * Depending on how the request information {@link IHubSection.IRequest} is set,
     * you can {@link IHubSection.IRequest.limit} limit the number of records per page,
     * {@link IHubSection.IRequest.search} search for sections that satisfy a specific
     * condition, or {@link IHubSection.IRequest.sort sort conditions} of sections
     * arbitrarily.
     *
     * @param input list request information {@link IHubSection.IRequest}
     * @returns paging {@link IHubSection} list {@link IPage}
     * @author Asher
     * @tag Systematic
     */
    @core.TypedRoute.Patch()
    public index(
      @props.AuthGuard() _actor: unknown,
      @core.TypedBody() input: IHubSection.IRequest,
    ): Promise<IPage<IHubSection>> {
      return HubSectionProvider.index(input);
    }

    /**
     * Detailed information about a specific section by section ID.
     *
     * Retrieve a specific {@link IHubSection}.
     *
     * @param id {@link IHubSection.id} to retrieve
     * @return retrieved section information
     * @author Asher
     * @tag Systematic
     */
    @core.TypedRoute.Get(":id")
    public at(
      @props.AuthGuard() _actor: unknown,
      @core.TypedParam("id") id: string & typia.tags.Format<"uuid">,
    ): Promise<IHubSection> {
      return HubSectionProvider.at(id);
    }

    /**
     * Detailed section information by section code.
     *
     * Retrieve specific {@link IHubSection}.
     *
     * @param code {@link IHubSection.code} to retrieve
     * @return retrieved section information
     * @author Asher
     * @tag Systematic
     */
    @core.TypedRoute.Get(":code/get")
    public get(
      @props.AuthGuard() _actor: unknown,
      @core.TypedParam("code") code: string,
    ): Promise<IHubSection> {
      return HubSectionProvider.get(code);
    }
  }
  return HubSystematicSectionController;
}
