type LogLevel = "info" | "warn" | "error" | "debug";

const formatMessage = (level: LogLevel, message: string): string => {
  return `[${new Date().toISOString()}] ${level.toUpperCase()}: ${message}`;
};

const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(formatMessage("info", message), ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(formatMessage("warn", message), ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(formatMessage("error", message), ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(formatMessage("debug", message), ...args);
    }
  },
};

export default logger;
