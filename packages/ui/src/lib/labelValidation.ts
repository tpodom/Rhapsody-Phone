export const nameValidationRules = [
  (val: string) =>
    (val?.length > 1 && val?.length < 30) || "Name must be between 2 and 30 characters.",
];
