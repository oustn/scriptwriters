import { logger } from "./log";

export function done(returnValue?: unknown) {
  logger.info("🎉🎉🎉🎉🎉");
  $done(returnValue);
}

export function panic(message: string) {
  logger.error("❌", message);
  $done();
}

export function wait(duration = 1): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, duration * 1000);
  });
}

export function call(fn: () => unknown) {
  if (typeof fn !== "function") {
    panic("Task is not a function");
  }

  try {
    const result = fn();
    if (result instanceof Promise) {
      result
        .then((data) => {
          done(data);
        })
        .catch((error) => {
          if (error instanceof Error) {
            panic(error.message);
            return;
          }
          panic(error as string);
        });
    } else {
      done(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      panic(error.message);
      return;
    }
    panic(error as string);
  }
}
