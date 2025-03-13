import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubMember } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubMember";

import { HubMemberPasswordProvider } from "../../../../providers/hub/actors/HubMemberPasswordProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";

@Controller("hub/customers/authenticate/password")
export class HubCustomerAuthenticatePasswordController {
  /**
   * Change Password.
   *
   * Change the password of the member account.
   *
   * @param input Password change information
   * @author Samchon
   * @tag Authenticate
   * @deprecated
   */
  @core.TypedRoute.Put("change")
  public change(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedBody() input: IHubMember.IPasswordChange,
  ): Promise<void> {
    return HubMemberPasswordProvider.change({
      customer,
      input,
    });
  }

  //
  //  * 비밀번호를 초기화 신청.
  //  *
  //  * 회원 계정의 이메일로 비밀번호 초기화 링크를 전송한다.
  //  *
  //  * @param input 초기화 입력 정보
  //  * @author Samchon
  //  * @tag Authenticate
  //  */
  // @core.TypedRoute.Put("reset")
  // public async reset(
  //     @HubCustomerAuth() customer: IHubCustomer,
  //     @core.TypedBody() input: IHubMember.IPasswordReset,
  // ): Promise<void> {
  //     input;
  // }

  //
  //  * 비밀번호 초기화 실시.
  //  *
  //  * 회원이 위 {@link create} 함수로부터 전달된 초기화 링크를 클릭시 호출되는 API.
  //  *
  //  * 그리하여 회원의 비밀번호가 실제로 초기화된다.
  //  *
  //  * @param token 비밀번호 초기화 링크상 토큰값
  //  * @author Samchon
  //  * @tag Authenticate
  //  *
  //  * @todo 로직도 정책도 없는 상황
  //  */
  // @core.TypedRoute.Get("reset/:token/confirm")
  // public async confirm(
  //     @HubCustomerAuth() customer: IHubCustomer,
  //     @core.TypedParam("token") token: string,
  // ): Promise<void> {
  //     token;
  // }
}
