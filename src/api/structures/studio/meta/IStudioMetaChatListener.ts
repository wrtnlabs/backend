import { IStudioMetaChatServiceCancelFunction } from "./IStudioMetaChatServiceCancelFunction";
import { IStudioMetaChatServiceCompleteFunction } from "./IStudioMetaChatServiceCompleteFunction";
import { IStudioMetaChatServiceDescribeFunctions } from "./IStudioMetaChatServiceDescribeFunctions";
import { IStudioMetaChatServiceDialogue } from "./IStudioMetaChatServiceDialogue";
import { IStudioMetaChatServiceFillArguments } from "./IStudioMetaChatServiceFillArguments";
import { IStudioMetaChatServiceSelectFunction } from "./IStudioMetaChatServiceSelectFunction";
import { IStudioMetaChatServiceTokenUsage } from "./IStudioMetaChatServiceTokenUsage";

/**
 * A set of functions that the Meta LLM client provides to the server.
 *
 * `IStudioMetaChatListener` is an interface that defines a set of functions that
 * the **client** provides to the Meta LLM server. Through this interface, the Meta LLM
 * server RPCs (Remote Procedure Calls) the client's `IStudioMetaChatListener` functions.
 *
 * @author Samchon
 */
export interface IStudioMetaChatListener {
  initialize?(): Promise<void>;

  /**
   * The Meta LLM server talks to the user.
   *
   * A function called when the Meta LLM server talks to the client.
   *
   * @param dialogue The conversation message.
   */
  talk(dialogue: IStudioMetaChatServiceDialogue): Promise<void>;

  /**
   * Selects a target function for the function call.
   *
   * When the Meta LLM server specifies a target function for the LLM function call
   * during a conversation with the user, before entering the function call arguments
   * composition and execution, a function that informs the client in advance
   * what the specified function is.
   *
   * @param props Target function information
   */
  selectFunction(props: IStudioMetaChatServiceSelectFunction): Promise<void>;

  /**
   * Cancels the a function to function call.
   *
   * When the Meta LLM server cancels a candidate function that has been listed up
   * for the LLM function calling by analyzing the conversation contexts with user,
   * this function is called for informing the event to the client.
   *
   * @param props Target function information
   */
  cancelFunction(props: IStudioMetaChatServiceCancelFunction): Promise<void>;

  /**
   * Filling in arguments for a function call.
   *
   * In LLM Function Calls, there are cases where a person must fill in some argument
   * values directly. For example, entering an authentication key for an account of
   * another service such as Google, or directly uploading a file.
   *
   * `IStudioMetaFunctionCall.arguments` is a function called when a person must directly
   * configure some (or all) of the argument values to be used in a function call.
   *
   * The client developer can develop a function that receives values from the user based
   * on {@link IOpenAiSchema} and returns them.
   *
   * Currently, the following cases are received separately from the client in our service.
   *
   * - {@link IOpenAiSchema.IString["x-wrtn-secret-key"]}
   * - {@link IOpenAiSchema.IString.contentMediaType}
   *
   * @param props The function and argument types that are being called
   * @param from The source of the function, whether it is a regular connector function
   *             or a workflow template
   * @returns A value or rejection configured by the client based on the type
   */
  fillArguments(
    props: IStudioMetaChatServiceFillArguments,
  ): Promise<IStudioMetaChatServiceFillArguments.IResponse>;

  /**
   * Completes the function call and reports its return value.
   *
   * A function that the Meta LLM server completes the LLM function call execution
   * and reports its success or failure, return value, etc.
   *
   * @param props Function call history
   */
  completeFunction(
    props: IStudioMetaChatServiceCompleteFunction,
  ): Promise<void>;

  /**
   * Describe results of the function executions.
   *
   * @param props Description of function executions
   */
  describeFunctionCalls(
    props: IStudioMetaChatServiceDescribeFunctions,
  ): Promise<void>;

  /**
   * Token usage information.
   *
   * In the A.I. chatbot session, token usage of the session is calculated in
   * every stage of the conversation, and the usage information is notified
   * to the client through this `IStudioMetaChatListener.tokenUsage()` function.
   *
   * @param usage Token usage info
   */
  tokenUsage?(usage: IStudioMetaChatServiceTokenUsage): Promise<void>;

  // /**
  //  * Handle payment during the function call.
  //  *
  //  * In the LLM Function Calls, there can be a function which requires a
  //  * payment. In that case, the Meta LLM server calls the client's
  //  * `IStudioMetaChatListener.handlePayment()` function to step the payment
  //  * process, with the target `orderId` and `amount` of the payment price
  //  * including the `currency`.
  //  *
  //  * The client developer must implement the payment process to utilize
  //  * the payment gateway service, such as "Stripe" or "Toss-Payments", and
  //  * return the payment information from the payment vendor service. If the
  //  * payment has been halted suddenly, the client should return `null`.
  //  *
  //  * @param props Properties for the payment
  //  * @returns Payment information from the payment gateway service.
  //  */
  // handlePayment?(
  //   props: IStudioMetaChatServicePayment.ICreate,
  // ): Promise<IStudioMetaChatServicePayment | null>;

  // /**
  //  * A SIGTERM signal occurs on the backend server.
  //  *
  //  * A SIGTERM signal may occur on the backend server due to an update deployment or
  //  * a random restart by Carpenter.
  //  *
  //  * And `IStudioMetaChatListener.sigterm()` is an RPC function called from the backend
  //  * server to notify the client of the SIGTERM event.
  //  *
  //  * After receiving this function, the client should recognize that the backend server
  //  * will be terminated within approximately 15 seconds and take corresponding measures.
  //  * Of course, if there is already a response to the {@link WebSocketConnector.join}
  //  * function, there is no need for the front end to do anything.
  //  */
  // sigterm?(): Promise<void>;
}
