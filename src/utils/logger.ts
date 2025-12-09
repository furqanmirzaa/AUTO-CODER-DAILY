/**
 * Logger Utility
 * 
 * Provides structured logging with timestamps and log levels.
 * Outputs to console with optional file logging support.
 */

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    data?: unknown;
}

/**
 * Format a log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
    const levelColors: Record<LogLevel, string> = {
        [LogLevel.DEBUG]: '\x1b[36m', // Cyan
        [LogLevel.INFO]: '\x1b[32m',  // Green
        [LogLevel.WARN]: '\x1b[33m',  // Yellow
        [LogLevel.ERROR]: '\x1b[31m', // Red
    };
    const reset = '\x1b[0m';
    const color = levelColors[entry.level];

    let output = `${color}[${entry.timestamp}] [${entry.level}]${reset} ${entry.message}`;

    if (entry.data !== undefined) {
        output += `\n${JSON.stringify(entry.data, null, 2)}`;
    }

    return output;
}

/**
 * Create a log entry with current timestamp
 */
function createLogEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
        timestamp: new Date().toISOString(),
        level,
        message,
        data,
    };
}

/**
 * Logger class with methods for each log level
 */
class Logger {
    private context: string;

    constructor(context: string = 'AutoCoderDaily') {
        this.context = context;
    }

    /**
     * Create a child logger with a specific context
     */
    child(context: string): Logger {
        return new Logger(`${this.context}:${context}`);
    }

    /**
     * Log a debug message
     */
    debug(message: string, data?: unknown): void {
        const entry = createLogEntry(LogLevel.DEBUG, `[${this.context}] ${message}`, data);
        console.log(formatLogEntry(entry));
    }

    /**
     * Log an info message
     */
    info(message: string, data?: unknown): void {
        const entry = createLogEntry(LogLevel.INFO, `[${this.context}] ${message}`, data);
        console.log(formatLogEntry(entry));
    }

    /**
     * Log a warning message
     */
    warn(message: string, data?: unknown): void {
        const entry = createLogEntry(LogLevel.WARN, `[${this.context}] ${message}`, data);
        console.warn(formatLogEntry(entry));
    }

    /**
     * Log an error message
     */
    error(message: string, data?: unknown): void {
        const entry = createLogEntry(LogLevel.ERROR, `[${this.context}] ${message}`, data);
        console.error(formatLogEntry(entry));
    }

    /**
     * Log the start of an operation
     */
    startOperation(operation: string): void {
        this.info(`Starting: ${operation}`);
    }

    /**
     * Log the successful completion of an operation
     */
    endOperation(operation: string, durationMs?: number): void {
        const duration = durationMs ? ` (${durationMs}ms)` : '';
        this.info(`Completed: ${operation}${duration}`);
    }

    /**
     * Log a failed operation
     */
    failOperation(operation: string, error: Error): void {
        this.error(`Failed: ${operation}`, { error: error.message, stack: error.stack });
    }
}

// Export singleton logger instance
export const logger = new Logger();

// Export Logger class for creating child loggers
export { Logger };
