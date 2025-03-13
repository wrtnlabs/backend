import { Module } from "@nestjs/common";

import { HubCustomerMemberController } from "./HubCustomerMemberController";

@Module({
  controllers: [HubCustomerMemberController],
})
export class HubCustomerMemberModule {}
