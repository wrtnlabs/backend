import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IBbsArticleComment } from "@wrtnlabs/os-api/lib/structures/common/IBbsArticleComment";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";

import { HubGlobal } from "../../HubGlobal";
import { BbsArticleCommentSnapshotProvider } from "./BbsArticleCommentSnapshotProvider";

export namespace BbsArticleCommentProvider {
  export namespace json {
    export const transform = (
      input: Prisma.bbs_article_commentsGetPayload<ReturnType<typeof select>>,
    ): IBbsArticleComment => ({
      id: input.id,
      parent_id: input.parent_id,
      snapshots: input.snapshots
        .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
        .map(BbsArticleCommentSnapshotProvider.json.transform),
      created_at: input.created_at.toISOString(),
    });
    export const select = () =>
      ({
        include: {
          snapshots: BbsArticleCommentSnapshotProvider.json.select(),
        } as const,
      }) satisfies Prisma.bbs_article_commentsFindManyArgs;
  }

  export const search = (
    input: IBbsArticleComment.IRequest.ISearch | undefined,
  ) =>
    (input?.body?.length
      ? [
          {
            snapshots: {
              some: {
                body: {
                  contains: input.body,
                  mode: "insensitive",
                },
              },
            },
          },
        ]
      : []) satisfies Prisma.bbs_article_commentsWhereInput["AND"];

  export const orderBy = (
    _key: IBbsArticleComment.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    ({
      created_at: value,
    }) satisfies Prisma.bbs_article_commentsOrderByWithRelationInput;

  export const collect =
    <
      Input extends IBbsArticleComment.ICreate,
      Snapshot extends
        Prisma.bbs_article_comment_snapshotsCreateWithoutCommentInput,
    >(
      type: string,
      snapshotFactory: (input: Input) => Snapshot,
    ) =>
    (article: IEntity) =>
    (input: Input) => {
      const snapshot = snapshotFactory(input);
      return {
        id: v4(),
        type,
        article: {
          connect: { id: article.id },
        },
        snapshots: {
          create: [snapshot],
        },
        created_at: new Date(),
        deleted_at: null,
      } satisfies Prisma.bbs_article_commentsCreateInput;
    };

  export const erase = (id: string) =>
    HubGlobal.prisma.bbs_article_comments.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
}
