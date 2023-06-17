export function done(returnValue: unknown) {
  $done(returnValue);
}

export function wait(duration = 1): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, duration * 1000);
  });
}

export function call(fn: () => unknown) {
  if (typeof fn !== "function") {
    throw new Error("Task is not a function");
  }

  try {
    const result = fn();
    if (result instanceof Promise) {
      result
        .then((data) => {
          $done(data);
        })
        .catch((error) => {
          throw error;
        });
    } else {
      $done(result);
    }
  } catch (error) {
    throw error;
  }
}
