import serializeError = require("serialize-error");

export namespace ErrorUtil {
  export function serialize(err: any): object {
    return err instanceof Error
      ? ((<any>err) as IJsonable).toJSON instanceof Function
        ? ((<any>err) as IJsonable).toJSON()
        : serializeError(err)
      : err;
  }
}

interface IJsonable {
  toJSON(): any;
}
