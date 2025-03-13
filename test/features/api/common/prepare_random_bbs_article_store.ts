import { ArrayUtil, RandomGenerator } from "@nestia/e2e";
import { randint } from "tstl";

import { IBbsArticle } from "@wrtnlabs/os-api/lib/structures/common/IBbsArticle";

import { prepare_random_attachment_file } from "./prepare_random_attachment_file";

export function prepare_random_bbs_article_store(): IBbsArticle.ICreate {
  return {
    title: RandomGenerator.paragraph()(),
    body: RandomGenerator.content()()(),
    format: "txt",
    files: ArrayUtil.repeat(randint(0, 3))(() =>
      prepare_random_attachment_file(),
    ),
  };
}
