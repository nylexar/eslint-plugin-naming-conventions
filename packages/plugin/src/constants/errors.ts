export const messageIds = {
  MISMATCH: "MISMATCH",
  PROHIBITED: "PROHIBITED",
  NO_APPLICABLE_RULE: "NO_APPLICABLE_RULE",
} as const;

export const errors = {
  MISMATCH: `{{prefix}}{{path}} does not match the {{type}} expected pattern: {{pattern}}.`,

  PROHIBITED: `{{prefix}}{{path}} matches the prohibited {{type}} pattern: {{pattern}}.`,

  NO_APPLICABLE_RULE: `{{prefix}}{{path}} has no applicable naming rule.`,
};

export type ErrorMessageId = keyof typeof errors;
