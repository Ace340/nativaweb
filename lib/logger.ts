/**
 * Logger utility
 * Wraps Next.js logger with consistent formatting
 */

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, data?: Record<string, unknown>) {
    console.log(`[${this.context}] ${message}`, data || "");
  }

  error(message: string, error?: Error | unknown, data?: Record<string, unknown>) {
    const errorDetails = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : error;

    console.error(`[${this.context}] ${message}`, errorDetails || "", data || "");
  }

  warn(message: string, data?: Record<string, unknown>) {
    console.warn(`[${this.context}] ${message}`, data || "");
  }

  debug(message: string, data?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[${this.context}] DEBUG: ${message}`, data || "");
    }
  }
}

/**
 * Create a logger instance for a specific context
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}