export interface IBenchmarkBackend {
  open(props: IBenchmarkBackend.IProps): void;
  memory(): Promise<NodeJS.MemoryUsage>;
  close(): Promise<void>;
}
export namespace IBenchmarkBackend {
  export interface IProps {
    reset: boolean;
    mock_llm: boolean;
    trace: boolean;
  }
}
