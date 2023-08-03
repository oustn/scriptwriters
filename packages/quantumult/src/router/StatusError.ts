type StatusErrorObject = {
  error?: string;
  [key: string]: unknown;
};

export class StatusError extends Error {
  status: number;
  [key: string]: unknown;

  constructor(status = 500, body?: StatusErrorObject | string) {
    super(typeof body === "object" ? body.error : body);
    typeof body === "object" && Object.assign(this, body);
    this.status = status;
  }
}
