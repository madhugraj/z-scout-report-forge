
export class GeminiError extends Error {
  statusCode: number;
  responseData: any;

  constructor(message: string, statusCode: number, responseData: any) {
    super(message);
    this.name = "GeminiError";
    this.statusCode = statusCode;
    this.responseData = responseData;
  }
}
