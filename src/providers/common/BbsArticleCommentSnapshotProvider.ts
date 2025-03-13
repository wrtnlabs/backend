import { Prisma } from "@prisma/client";
import typia from "typia";
import { v4 } from "uuid";

import { IBbsArticleComment } from "@wrtnlabs/os-api/lib/structures/common/IBbsArticleComment";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";

import { HubGlobal } from "../../HubGlobal";
import { AttachmentFileProvider } from "./AttachmentFileProvider";

export namespace BbsArticleCommentSnapshotProvider {
  export namespace json {
    export const transform = (
      input: Prisma.bbs_article_comment_snapshotsGetPayload<
        ReturnType<typeof select>
      >,
    ): IBbsArticleComment.ISnapshot => ({
      id: input.id,
      format: typia.assert<IBbsArticleComment.ISnapshot["format"]>(
        input.format,
      ),
      body: input.body,
      files: input.to_files
        .sort((a, b) => a.sequence - b.sequence)
        .map((p) => AttachmentFileProvider.json.transform(p.file)),
      created_at: input.created_at.toISOString(),
    });
    export const select = () =>
      ({
        include: {
          to_files: {
            include: {
              file: AttachmentFileProvider.json.select(),
            },
          },
        },
      }) satisfies Prisma.bbs_article_comment_snapshotsFindManyArgs;
  }

  export const create =
    (comment: IEntity) =>
    async (
      input: IBbsArticleComment.IUpdate,
    ): Promise<IBbsArticleComment.ISnapshot> => {
      const snapshot =
        await HubGlobal.prisma.bbs_article_comment_snapshots.create({
          data: {
            ...collect(input),
            comment: { connect: { id: comment.id } },
          },
          ...json.select(),
        });
      return json.transform(snapshot);
    };

  export const collect = (input: IBbsArticleComment.ICreate) =>
    ({
      id: v4(),
      format: input.format,
      body: input.body,
      created_at: new Date(),
      to_files: {
        create: input.files.map((file, i) => ({
          id: v4(),
          file: {
            create: AttachmentFileProvider.collect(file),
          },
          sequence: i,
        })),
      },
    }) satisfies Prisma.bbs_article_comment_snapshotsCreateWithoutCommentInput;
}
