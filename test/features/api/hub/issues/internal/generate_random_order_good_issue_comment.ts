import { RandomGenerator } from "@nestia/e2e";

import HubApi from "@wrtnlabs/os-api/lib/index";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";
import { IHubOrderGoodIssue } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssue";
import { IHubOrderGoodIssueComment } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssueComment";

import { ConnectionPool } from "../../../../../ConnectionPool";

export const generate_random_order_good_issue_comment = async (
  pool: ConnectionPool,
  actor: "customers" | "sellers",
  order: IHubOrder,
  good: IHubOrderGood,
  issue: IHubOrderGoodIssue,
  input?: Partial<IHubOrderGoodIssueComment.ICreate>,
): Promise<IHubOrderGoodIssueComment> => {
  const comment: IHubOrderGoodIssueComment = await HubApi.functional.hub[
    actor
  ].orders.goods.issues.comments.create(
    actor === "customers" ? pool.customer : pool.seller,
    order.id,
    good.id,
    issue.id,
    {
      format: "txt",
      body: RandomGenerator.content()()(),
      files: [],
      ...(input ?? {}),
    },
  );
  return comment;
};
