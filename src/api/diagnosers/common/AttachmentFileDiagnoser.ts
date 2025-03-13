import { v4 } from "uuid";

import { IAttachmentFile } from "../../structures/common/IAttachmentFile";

export namespace AttachmentFileDiagnoser {
  export const preview = (input: IAttachmentFile.ICreate): IAttachmentFile => ({
    id: v4(),
    name: input.name,
    extension: input.extension,
    url: input.url,
    created_at: new Date().toISOString(),
  });

  export const replica = (input: IAttachmentFile): IAttachmentFile.ICreate => ({
    name: input.name,
    extension: input.extension,
    url: input.url,
  });
}
