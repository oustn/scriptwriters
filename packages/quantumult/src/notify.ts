import { stringify } from "./log";

export function notify(
  title: string,
  subtitle?: string,
  body?: string,
  options: NotifyOptions = {}
) {
  $notify(
    stringify(title),
    subtitle && stringify(subtitle),
    body && stringify(body),
    options
  );
}
