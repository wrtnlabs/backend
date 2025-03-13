import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { v4 } from "uuid";

import { IPresignedUrl } from "@wrtnlabs/os-api/lib/structures/common/IPresignedUrl";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { S3Util } from "../../../../utils/S3Util";
import { IHubControllerProps } from "../IHubControllerProps";

export function HubCommonAttachmentController(props: IHubControllerProps) {
  @Controller(`/hub/${props.path}/commons/attachments`)
  class HubCommonAttachmentController {
    /**
     * Publish Presigned URL
     *
     * @returns URL information
     * @author Asher
     * @tag commons
     */
    @core.TypedRoute.Get() //TODO : AuthGuard로 권한 체크
    async publish(): Promise<IPresignedUrl> {
      return await S3Util.getPutObjectUrl(v4());
    }

    /**
     * Issue Presigned URL (V2)
     *
     * Issues Presigned URL by entering file name and file extension.
     *
     * @returns URL information
     * @author Asher
     * @tag commons
     */
    @core.TypedRoute.Patch("v2")
    async publishV2(
      @HubCustomerAuth() customer: IHubCustomer,
      @core.TypedBody() input: IPresignedUrl.ICreate,
    ): Promise<IPresignedUrl> {
      return await S3Util.getPutObjectUrlV2({
        customer,
        name: input.name,
        extension: input.extension,
      });
    }
  }

  return HubCommonAttachmentController;
}
