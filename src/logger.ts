
// A simple logger service for logging errors.

interface LogInfo {
    [key: string]: any;
}

export const logError = (error: Error, info?: LogInfo) => {
    console.error("Error:", error.message);
    if (info) {
        console.error("Additional Info:", info);
    }
    if (error.stack) {
        console.error("Stack Trace:", error.stack);
    }
};
