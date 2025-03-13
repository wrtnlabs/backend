import { IHubDeposit } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDeposit";

import { HubDepositProvider } from "../../providers/hub/deposits/HubDepositProvider";

export namespace HubDepositSeeder {
  export const seed = async (): Promise<void> => {
    for (const input of DATA)
      await HubDepositProvider.create({
        admin: null,
        input,
      });
  };
}

const DATA: IHubDeposit.ICreate[] = [
  {
    code: "hub_order_good_issue_fee_accept",
    source: "hub_order_good_issue_fee_accepts",
    direction: -1,
  },
  {
    code: "hub_deposit_charge",
    source: "hub_deposit_charges",
    direction: 1,
  },
  {
    code: "hub_deposit_donation",
    source: "hub_deposit_donations",
    direction: 1,
  },
];
