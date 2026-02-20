import { DiagnosticError, fetchWithDiagnostic } from "./sync-diagnostic";

describe("fetchWithDiagnostic", () => {
  it("returns data and ok diagnostic on success", async () => {
    const result = await fetchWithDiagnostic<string[]>("lessons", async () => [
      "Math",
      "English",
    ]);

    expect(result.data).toEqual(["Math", "English"]);
    expect(result.diagnostic).toEqual({ category: "lessons", code: "ok" });
  });

  it("returns empty array and http_error for DiagnosticError", async () => {
    const result = await fetchWithDiagnostic<string[]>("homework", async () => {
      throw new DiagnosticError("http_error", 404, "Not Found");
    });

    expect(result.data).toEqual([]);
    expect(result.diagnostic).toEqual({
      category: "homework",
      code: "http_error",
      httpStatus: 404,
      detail: "Not Found",
    });
  });

  it("returns empty array and shape_mismatch for DiagnosticError", async () => {
    const result = await fetchWithDiagnostic<string[]>(
      "substitutions",
      async () => {
        throw new DiagnosticError("shape_mismatch", undefined, "Expected array");
      }
    );

    expect(result.data).toEqual([]);
    expect(result.diagnostic).toEqual({
      category: "substitutions",
      code: "shape_mismatch",
      detail: "Expected array",
    });
  });

  it("returns network_error for generic errors", async () => {
    const result = await fetchWithDiagnostic<string[]>("messages", async () => {
      throw new Error("fetch failed");
    });

    expect(result.data).toEqual([]);
    expect(result.diagnostic).toEqual({
      category: "messages",
      code: "network_error",
      detail: "fetch failed",
    });
  });

  it("handles non-Error throws as network_error", async () => {
    const result = await fetchWithDiagnostic<string[]>("lessons", async () => {
      throw "string error";
    });

    expect(result.data).toEqual([]);
    expect(result.diagnostic.code).toBe("network_error");
    expect(result.diagnostic.detail).toBe("string error");
  });
});
