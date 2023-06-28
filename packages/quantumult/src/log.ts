import log from "loglevel";

import { isDev } from "./constant";

const logger = log.getLogger("Scriptwriter");

const noop = () => {
  //
};

type MethodName = log.LogLevelNames | "log";

const ICON_MAP: Record<MethodName, string> = {
  trace: "🔍",
  debug: "🐛",
  log: "🐛",
  info: "💡",
  warn: "⚠️",
  error: "💣",
};

// class Timestamp {
//   now = new Date();
//
//   toString(): string {
//     const timestamp = this.now.toLocaleTimeString("zh", { hour12: false });
//     return `[${timestamp}]`;
//   }
// }

export function stringify(something: unknown): string {
  if (
    something instanceof Error ||
    something instanceof Date ||
    something instanceof RegExp
  ) {
    return `${something}`;
  }

  if (typeof something === "object" && something) {
    return JSON.stringify(something);
  }

  return `${something}`;
}

class ScriptwriterConsole {
  $log: log.LoggingMethod = realMethod(console, "log");
  $trace: log.LoggingMethod = realMethod(console, "trace");
  $debug: log.LoggingMethod = realMethod(console, "debug");
  $info: log.LoggingMethod = realMethod(console, "info");
  $warn: log.LoggingMethod = realMethod(console, "warn");
  $error: log.LoggingMethod = realMethod(console, "error");

  log(...message: unknown[]) {
    this.$log(this.transformMessage(this.getStub("debug"), ...message));
  }

  trace(...message: unknown[]) {
    this.$trace(this.transformMessage(this.getStub("trace"), ...message));
  }

  debug(...message: unknown[]) {
    this.$debug(this.transformMessage(this.getStub("debug"), ...message));
  }

  info(...message: unknown[]) {
    this.$info(this.transformMessage(this.getStub("info"), ...message));
  }

  warn(...message: unknown[]) {
    this.$warn(this.transformMessage(this.getStub("warn"), ...message));
  }

  error(...message: unknown[]) {
    this.$error(this.transformMessage(this.getStub("error"), ...message));
  }

  private getStub(methodName: MethodName) {
    // const timestamp = new Timestamp();
    // return `${timestamp.toString()}[${methodName.toUpperCase().slice(0, 1)}]:`;
    // return ICON_MAP[methodName];
    return "";
  }

  private transformMessage(...message: unknown[]): string {
    return message.map((message_: unknown) => stringify(message_)).join(" ");
  }
}

function bindMethod(obj: Console, methodName: MethodName) {
  const method = obj[methodName];
  if (typeof method.bind === "function") {
    return method.bind(obj);
  } else {
    try {
      return Function.prototype.bind.call(method, obj);
    } catch (e) {
      return function (...args: unknown[]) {
        return Function.prototype.apply.apply(method, [obj, args]);
      };
    }
  }
}

function realMethod(customConsole: Console, methodName: MethodName) {
  if (methodName === "debug") {
    methodName = "log";
  }

  if (customConsole[methodName] !== undefined) {
    return bindMethod(customConsole, methodName);
  } else if (customConsole.log !== undefined) {
    return bindMethod(customConsole, "log");
  } else {
    return noop;
  }
}

logger.methodFactory = function defaultMethodFactory(methodName) {
  /*jshint validthis:true */
  return realMethod(
    new ScriptwriterConsole() as unknown as Console,
    methodName
  );
};

logger.setDefaultLevel(log.levels.INFO);

logger.setLevel(isDev ? log.levels.TRACE : log.levels.INFO);

export { logger };
