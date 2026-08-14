declare module 'fbjs/lib/invariant' {
  export default function invariant(
    condition: unknown,
    format?: string,
    ...args: Array<unknown>
  ): asserts condition;
}

declare module 'fbjs/lib/warning' {
  export default function warning(
    condition: unknown,
    format?: string,
    ...args: Array<unknown>
  ): void;
}
