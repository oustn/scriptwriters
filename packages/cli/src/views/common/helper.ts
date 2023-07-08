export function getRedirectUrl(payload: Record<string, string | string[]>) {
  return `https://quantumult.app/x/open-app/add-resource?remote-resource=${JSON.stringify(
    payload,
    null,
    2
  )}`;
}

export function getTaskRedirectUrl(
  payload: Record<string, string | string[]> | string[]
) {
  return `https://quantumult.app/x/open-app/ui?module=gallery&type=task&action=add&content=${JSON.stringify(
    payload,
    null,
    2
  )}`;
}
