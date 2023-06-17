declare let $prefs: {
  valueForKey(key: string): string | undefined;
  setValueForKey(value: string, key: string): void;
  removeValueForKey(key: string): void;
};

type NotifyOptions = {
  "open-url"?: string;
  "media-url"?: string;
};

declare let $notify: (
  title: string,
  subtitle?: string,
  body?: string,
  options?: NotifyOptions
) => void;

declare let $done: (returnValue?: unknown) => void;

declare let $task: {
  fetch: (request: unknown) => Promise<{
    headers: {
      [key: string]: string;
    };
    body: string;
    statusCode: number;
    statusText: string;
  }>;
};

declare let $request: {
  method: string;
  url: string;
  headers: {
    [key: string]: string;
  };
  body?: string;
};
