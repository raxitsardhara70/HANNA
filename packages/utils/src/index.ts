export const exhaustiveCheck = (value: never): never => {
  throw new Error(`Unhandled value: ${String(value)}`);
};

export const readEnv = (key: string, fallback: string): string => {
  const value = process.env[key];
  return value === undefined || value.trim().length === 0 ? fallback : value;
};
