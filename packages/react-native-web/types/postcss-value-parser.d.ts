declare module 'postcss-value-parser' {
  type Node = {
    type: string;
    value: string;
  };

  function valueParser(value: string): { nodes: Array<Node> };
  export = valueParser;
}
