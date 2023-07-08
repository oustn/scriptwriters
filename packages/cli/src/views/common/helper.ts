export function getRedirectUrl(payload: Record<string, string | string[]>) {
  return `https://quantumult.app/x/open-app/add-resource?remote-resource=${JSON.stringify(
    payload,
    null,
    2,
  )}`;
}

export function getUIRedirectUrl(
  payload: Record<string, string | string[]> | string[],
  type: string,
) {
  return `https://quantumult.app/x/open-app/ui?module=gallery&type=${type}&action=add&content=${JSON.stringify(
    payload,
    null,
    2,
  )}`;
}
