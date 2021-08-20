export class ErrorHandler {
  public static handle = (error: Error): void => {
    console.error(error.message);
  };
}
