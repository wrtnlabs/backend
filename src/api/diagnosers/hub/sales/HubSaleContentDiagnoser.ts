import { v4 } from "uuid";

import { IHubSaleContent } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleContent";

import { AttachmentFileDiagnoser } from "../../common/AttachmentFileDiagnoser";

export namespace HubSaleContentDiagnoser {
  export const preview = (input: IHubSaleContent.ICreate): IHubSaleContent => ({
    id: v4(),
    lang_code: input.lang_code ?? "en",
    original: input.original ?? true,
    title: input.title,
    summary: input.summary,
    body: input.body,
    version_description: input.version_description,
    format: input.format,
    tags: input.tags,
    icons: input.icons.map(AttachmentFileDiagnoser.preview),
    thumbnails: input.thumbnails.map(AttachmentFileDiagnoser.preview),
    files: input.files.map(AttachmentFileDiagnoser.preview),
  });

  export const replica = (input: IHubSaleContent): IHubSaleContent.ICreate => ({
    lang_code: input.lang_code,
    original: input.original,
    title: input.title,
    summary: input.summary,
    body: input.body,
    version_description: input.version_description,
    format: input.format,
    tags: input.tags,
    icons: input.icons.map(AttachmentFileDiagnoser.replica),
    thumbnails: input.thumbnails.map(AttachmentFileDiagnoser.replica),
    files: input.files.map(AttachmentFileDiagnoser.replica),
  });
}
