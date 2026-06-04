export class ClaimVerificationException extends Error {
  constructor(
    public readonly handler: string,
    public readonly reason: string,
  ) {
    super(reason);
  }
}
