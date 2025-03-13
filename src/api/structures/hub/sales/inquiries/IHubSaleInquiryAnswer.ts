import { IBbsArticle } from "../../../common/IBbsArticle";
import { IHubSeller } from "../../actors/IHubSeller";

/**
 * Answer to the inquiry in the listing snapshot.
 *
 * {@link IHubSaleInquiryAnswer} is an entity that embodies the official
 * answer written by the seller to the inquiry written by the customer.
 * Of course, in addition to writing an official answer like this, the seller
 * can also communicate with the questioner and multiple customers through
 * comments in the attributed inquiry.
 *
 * Comments cannot be written on the answer. You should encourage comments
 * to be written on the inquiry.
 *
 * @author Samchon
 */
export interface IHubSaleInquiryAnswer extends IBbsArticle {
  /**
   * Author of the answer.
   */
  seller: IHubSeller.IInvert;
}
export namespace IHubSaleInquiryAnswer {
  export interface ISnapshot extends IBbsArticle.ISnapshot {}

  /**
   * Summary information of the reply.
   */
  export interface ISummary extends IBbsArticle.ISummary {
    seller: IHubSeller.IInvert;
  }

  /**
   * Input information required to write a reply.
   */
  export interface ICreate extends IBbsArticle.ICreate {}

  /**
   * Input information required to edit your reply.
   */
  export type IUpdate = ICreate;
}
