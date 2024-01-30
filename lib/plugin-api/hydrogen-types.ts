// These type definitions live in their own file because Pulsar can't parse the
// syntax used here. Note that these types do not depend on anything internal
// to Hydron, which should allow the typechecker to notice if any internal
// changes are not accompanied by appropriate compatibility changes to the
// plugin wrappers.
export type HydronResultsCallback = (
  message: any,
  channel: "shell" | "iopub" | "stdin"
) => void;
// Like HydronKernelMiddleware, but doesn't require passing a `next` argument.
// Hydron is responsible for creating these and ensuring that they delegate to
// the next middleware in the chain (or to the kernel, if there is no more
// middleware to call)
export interface HydronKernelMiddlewareThunk {
  readonly interrupt: () => void;
  readonly shutdown: () => void;
  readonly restart: (
    onRestarted: ((...args: Array<any>) => any) | null | undefined
  ) => void;
  readonly execute: (code: string, onResults: HydronResultsCallback) => void;
  readonly complete: (code: string, onResults: HydronResultsCallback) => void;
  readonly inspect: (
    code: string,
    cursorPos: number,
    onResults: HydronResultsCallback
  ) => void;
}
export interface HydronKernelMiddleware {
  readonly interrupt?: (next: HydronKernelMiddlewareThunk) => void;
  readonly shutdown?: (next: HydronKernelMiddlewareThunk) => void;
  readonly restart?: (
    next: HydronKernelMiddlewareThunk,
    onRestarted: ((...args: Array<any>) => any) | null | undefined
  ) => void;
  readonly execute?: (
    next: HydronKernelMiddlewareThunk,
    code: string,
    onResults: HydronResultsCallback
  ) => void;
  readonly complete?: (
    next: HydronKernelMiddlewareThunk,
    code: string,
    onResults: HydronResultsCallback
  ) => void;
  readonly inspect?: (
    next: HydronKernelMiddlewareThunk,
    code: string,
    cursorPos: number,
    onResults: HydronResultsCallback
  ) => void;
}
