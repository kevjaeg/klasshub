import { validatePlatformUrl } from "./validate-url";

describe("validatePlatformUrl", () => {
  it("accepts valid HTTPS URLs", () => {
    expect(() => validatePlatformUrl("https://school.iserv.de")).not.toThrow();
    expect(() => validatePlatformUrl("https://moodle.example.com")).not.toThrow();
  });

  it("rejects non-HTTPS protocols", () => {
    expect(() => validatePlatformUrl("http://school.iserv.de")).toThrow("Nur HTTPS");
    expect(() => validatePlatformUrl("ftp://school.iserv.de")).toThrow("Nur HTTPS");
  });

  it("rejects invalid URLs", () => {
    expect(() => validatePlatformUrl("not-a-url")).toThrow("Ungültige URL");
  });

  it("rejects localhost", () => {
    expect(() => validatePlatformUrl("https://localhost")).toThrow("Private");
    expect(() => validatePlatformUrl("https://localhost:3000")).toThrow("Private");
  });

  it("rejects loopback IPs", () => {
    expect(() => validatePlatformUrl("https://127.0.0.1")).toThrow("Private");
    expect(() => validatePlatformUrl("https://127.0.0.99")).toThrow("Private");
    expect(() => validatePlatformUrl("https://[::1]")).toThrow("Private");
  });

  it("rejects private IP ranges", () => {
    // 10.x.x.x
    expect(() => validatePlatformUrl("https://10.0.0.1")).toThrow("Private");
    // 192.168.x.x
    expect(() => validatePlatformUrl("https://192.168.1.1")).toThrow("Private");
    // 172.16-31.x.x
    expect(() => validatePlatformUrl("https://172.16.0.1")).toThrow("Private");
    expect(() => validatePlatformUrl("https://172.31.255.255")).toThrow("Private");
  });

  it("rejects AWS metadata endpoint", () => {
    expect(() => validatePlatformUrl("https://169.254.169.254")).toThrow("Private");
  });

  it("rejects .local and .internal domains", () => {
    expect(() => validatePlatformUrl("https://myserver.local")).toThrow("Private");
    expect(() => validatePlatformUrl("https://app.internal")).toThrow("Private");
  });

  it("allows 172.x outside private range", () => {
    expect(() => validatePlatformUrl("https://172.15.0.1")).not.toThrow();
    expect(() => validatePlatformUrl("https://172.32.0.1")).not.toThrow();
  });
});
