import { ICheckPrivacy } from "@wrtnlabs/os-api/lib/structures/common/ICheckPrivacy";

export namespace CheckPrivacyProvider {
  export const check = async (
    input: ICheckPrivacy.IRequest,
  ): Promise<ICheckPrivacy.IInvalid[]> => {
    const invalidList = findInvalidList(input.text);

    if (invalidList.length > 0) {
      return invalidList;
    }

    return [];
  };

  function findInvalidList(inputs: string[]): ICheckPrivacy.IInvalid[] {
    const privacyRegexList = [
      /**
       * 주민등록번호
       */
      /(?:[0-9]{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[1,2][0-9]|3[0,1]))-[1-4][0-9]{6}/,
      /**
       * 전화번호
       */
      /^\d{2,3}-\d{3,4}-\d{4}$/,
      /**
       * 카드번호
       */
      /^[0-9]{4}[-\s\.]?[0-9]{4}[-\s\.]?[0-9]{4}[-\s\.]?[0-9]{4}$/,
      /**
       * 운전면허번호
       */
      /(\d{2}-\d{2}-\d{6}-\d{2})/,
      /**
       * 계좌번호
       */
      /[0-9,\-]{3,6}\-[0-9,\-]{2,6}\-[0-9,\-]/,
      /**
       * 구여권번호
       */
      /[a-zA-Z]{1}[0-9a-zA-Z]{1}[0-9]{7}/,
      /**
       * 신여권번호
       */
      /[A-Z]\d{3}[a-zA-Z]\d{4}/,
      /**
       * IP주소(IPv4)
       */
      /(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}/,
      /**
       * IP주소(IPv6)
       */
      /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,
      /**
       * MAC주소
       */
      /([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}/,
      /**
       * Email
       */
      /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/,
      /**
       * URL
       */
      /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
      /**
       * 은행(증권)이름
       */
      /^.*.(은행|수협|뱅크|금고|증권|자산운용)$/,
      /**
       * NH농협or신협
       */
      /(NH농협|신협)$/,
      /**
       * 비밀번호
       */
      /^.*.(비밀번호|pwd|패스워드|비번|password|pw|Password|PW|PWD)?\s*(은|는|이|가|를)?\s*(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d@$!%*?&#.~_-]{8,}/,
    ];

    const regexNames = [
      "주민등록번호",
      "전화번호",
      "카드번호",
      "운전면허번호",
      "계좌번호",
      "구여권번호",
      "신여권번호",
      "IP주소(IPv4)",
      "IP주소(IPv6)",
      "MAC주소",
      "Email",
      "URL",
      "은행(증권)이름",
      "NH농협or신협",
      "비밀번호",
    ];

    const invalidList: ICheckPrivacy.IInvalid[] = [];

    inputs.forEach((currentInput) => {
      privacyRegexList.some((regex, i) => {
        if (regex.test(currentInput)) {
          invalidList.push({ word: currentInput, regex: regexNames[i] });
          return true;
        }
        return false;
      });
    });
    return invalidList;
  }
}
