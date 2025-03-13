import { tags } from "typia";

import { IAttachmentFile } from "../../common/IAttachmentFile";
import { IHubCustomer } from "../actors/IHubCustomer";

/**
 * Content information of the listing.
 *
 * `IHubSaleContent` is an entity that visualizes the main content of
 * the listing including the language code. In other words, the `IHubSaleContent`
 * records can be multiple in one {@link IHubSaleSnapshot}, and each record
 * represents the content of the {@link IHubSaleSnapshot} record, in a different
 * language.
 *
 * For reference, attachment files like icons and images are belonged to this
 * `IHubSaleContent` entity. It's because the attachment files may contain the
 * prohibited signs or symbols in the national or cultural level. If every icons
 * and files in each language content are the same, just keep saving to this entity
 * copying and pasting their URL addresses.
 *
 * @author Samchon
 */
export interface IHubSaleContent {
  /**
   *  Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Language code.
   */
  lang_code: IHubCustomer.LanguageType;

  /**
   * Whether the language is original or not.
   */
  original: boolean;

  /**
   *  title.
   */
  title: string;

  /**
   * Summary Information
   */
  summary: string | null;

  /**
   * Description information in the text.
   */
  body: string;

  /**
   * Version Description.
   *
   * You can record information about the version description.
   */
  version_description: string | null;

  /**
   * Body format.
   */
  format: IHubSaleContent.Type;

  /**
   * A list of search tag values.
   */
  tags: string[];

  /**
   * List of product representative icons.
   */
  icons: IAttachmentFile[];

  /**
   * Product thumbnail.
   */
  thumbnails: IAttachmentFile[];

  /**
   * List of attachments.
   */
  files: IAttachmentFile[];
}

export namespace IHubSaleContent {
  export type Type = "html" | "md" | "txt";

  export interface IInvert {
    /**
     *  Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Language code.
     */
    lang_code: IHubCustomer.LanguageType;

    /**
     * Whether the language is original or not.
     */
    original: boolean;

    /**
     *  title.
     */
    title: string;

    /**
     * A brief explanation.
     */
    summary: string | null;

    /**
     * Version Description.
     *
     * You can record information about the version description.
     */
    version_description: string | null;

    /**
     * A list of search tag values.
     */
    tags: string[];

    /**
     * List of representative product images.
     */
    icons: IAttachmentFile[];
  }

  export type ISummary = IInvert;

  /**
   * Create information of a content with language code.
   *
   * For reference, attachment files like icons and images are belonged to this
   * `IHubSaleContent` entity. It's because the attachment files may contain the
   * prohibited signs or symbols in the national or cultural level. If not and
   * every icons and files in each language content are the same, just keep saving
   * to this entity copying and pasting their URL addresses.
   */
  export interface ICreate {
    /**
     * Language code.
     */
    lang_code?: IHubCustomer.LanguageType;

    /**
     * Whether the language is original or not.
     */
    original?: boolean;

    /**
     *  title.
     */
    title: string;

    /**
     * Summary Information
     */
    summary: string | null;

    /**
     * Description information in the text.
     */
    body: string;

    /**
     * Version Description.
     *
     * You can record information about the version description.
     */
    version_description: string | null;

    /**
     * Body format.
     */
    format: IHubSaleContent.Type;

    /**
     * A list of search tag values.
     */
    tags: string[] & tags.UniqueItems;

    /**
     * List of representative product images.
     */
    icons: IAttachmentFile.ICreate[];

    /**
     * Product thumbnail.
     */
    thumbnails: IAttachmentFile.ICreate[];

    /**
     * List of attachments.
     */
    files: IAttachmentFile.ICreate[];
  }
}
