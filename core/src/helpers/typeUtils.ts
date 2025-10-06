/* eslint-disable @typescript-eslint/no-explicit-any */
export type FirstArg<T> = T extends (
  first: infer FirstArgument,
  ...args: any[]
) => any
  ? FirstArgument
  : never

export type SecondArg<T> = T extends (
  first: unknown,
  second: infer SecondArgument,
  ...args: any[]
) => any
  ? SecondArgument
  : never