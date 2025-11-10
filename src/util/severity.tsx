export type Severity =
  | "INFO"
  | "SUCCESS"
  | "ERROR"
  | "WARNING"
  | "PRIMARY"
  | "SECONDARY"
  | "ACCENT";

export function btnForSeverity(s: Severity): string {
  return {
    INFO: "btn-info",
    SUCCESS: "btn-success",
    ERROR: "btn-error",
    WARNING: "btn-warning",
    PRIMARY: "btn-primary",
    SECONDARY: "btn-seconday",
    ACCENT: "btn-accent",
  }[s];
}

export function alertForSeverity(s: Severity): string {
  return {
    INFO: "alert-info",
    SUCCESS: "alert-success",
    ERROR: "alert-error",
    WARNING: "alert-warning",
    PRIMARY: "alert-primary",
    SECONDARY: "alert-seconday",
    ACCENT: "alert-accent",
  }[s];
}
