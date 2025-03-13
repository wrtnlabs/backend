export namespace SerdeEmender {
  export const emend = (input: any): any => {
    if (typeof input === "object")
      if (input === null) return null;
      else if (Array.isArray(input)) return emendArray(input);
      else if (input instanceof Map) return emendMap(input);
      else if (input instanceof Set) return emendSet(input);
      else return emendObject(input);
    return input;
  };

  const emendArray = (array: any[]) => array.map(emend);
  const emendObject = (object: Record<string, any>) =>
    Object.fromEntries(
      Object.entries(object).map(([key, value]) => [key, emend(value)]),
    );
  const emendMap = (map: Map<string, any>) =>
    Object.fromEntries(
      Array.from(map.entries()).map(([key, value]) => [key, emend(value)]),
    );
  const emendSet = (set: Set<any>) => Array.from(set).map(emend);
}
