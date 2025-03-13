import { IHubSaleQuestion } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleQuestion";

export namespace HubSaleQuestionDiagnoser {
  export const replica = (
    question: IHubSaleQuestion,
  ): IHubSaleQuestion.ICreate => ({
    format: question.snapshots.at(-1)!.format,
    title: question.snapshots.at(-1)!.title,
    body: question.snapshots.at(-1)!.body,
    files: question.snapshots.at(-1)!.files.map((file) => ({
      name: file.name,
      extension: file.extension,
      url: file.url,
    })),
    secret: false,
  });

  export const summarize = (
    question: IHubSaleQuestion,
  ): IHubSaleQuestion.ISummary => ({
    id: question.id,
    type: "question",
    customer: question.customer,
    title: question.snapshots.at(-1)!.title,
    secret: question.secret,
    read_by_seller: question.read_by_seller,
    created_at: question.created_at,
    updated_at: question.snapshots.at(-1)!.created_at,
    answer:
      question.answer !== null
        ? {
            id: question.answer.id,
            seller: question.answer.seller,
            title: question.answer.snapshots.at(-1)!.title,
            created_at: question.answer.created_at,
            updated_at: question.answer.snapshots.at(-1)!.created_at,
          }
        : null,
  });
}
