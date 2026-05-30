// Error type for expected API failures where the response status is known.
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        // Restore the prototype chain for custom Error subclasses in TypeScript.
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
