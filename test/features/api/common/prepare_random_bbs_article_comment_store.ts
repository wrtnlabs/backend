import { ArrayUtil, RandomGenerator } from "@nestia/e2e";
import { randint } from "tstl";

import { IBbsArticleComment } from "@wrtnlabs/os-api/lib/structures/common/IBbsArticleComment";

import { prepare_random_attachment_file } from "./prepare_random_attachment_file";

export function prepare_random_bbs_article_comment_store(): IBbsArticleComment.ICreate {
  return {
    format: "txt",
    body: RandomGenerator.content()()(),
    files: ArrayUtil.repeat(randint(0, 3))(() =>
      prepare_random_attachment_file(),
    ),
  };
}
