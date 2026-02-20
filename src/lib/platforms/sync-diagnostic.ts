import type { SyncDiagnostic, SyncDiagnosticCode } from "./types";

export class DiagnosticError extends Error {
  constructor(
    public readonly code: Exclude<SyncDiagnosticCode, "ok" | "not_supported">,
    public readonly httpStatus?: number,
    detail?: string
  ) {
    super(detail ?? code);
    this.name = "DiagnosticError";
  }
}

export interface DiagnosticResult<T> {
  data: T;
  diagnostic: SyncDiagnostic;
}

export async function fetchWithDiagnostic<T>(
  category: SyncDiagnostic["category"],
  fn: () => Promise<T>
): Promise<DiagnosticResult<T extends (infer U)[] ? U[] : T>> {
  try {
    const data = await fn();
    return {
      data: data as T extends (infer U)[] ? U[] : T,
      diagnostic: { category, code: "ok" },
    };
  } catch (error) {
    if (error instanceof DiagnosticError) {
      return {
        data: [] as T extends (infer U)[] ? U[] : T,
        diagnostic: {
          category,
          code: error.code,
          httpStatus: error.httpStatus,
          detail: error.message,
        },
      };
    }
    return {
      data: [] as T extends (infer U)[] ? U[] : T,
      diagnostic: {
        category,
        code: "network_error",
        detail: error instanceof Error ? error.message : String(error),
      },
    };
  }
}
