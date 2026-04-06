export declare class ClaimVerificationException extends Error {
    readonly handler: string;
    readonly reason: string;
    constructor(handler: string, reason: string);
}
