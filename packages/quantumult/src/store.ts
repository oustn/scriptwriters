import { DEFAULT_KEY, INTERNAL_KEY } from "./constant";

interface InternalData {
  keys?: string[];
}

type StoreValue<T> = Record<string, T>;

function parse<T>(value: string): T | undefined {
  try {
    return JSON.parse(value);
  } catch (e) {
    // logger.log(`Error parsing JSON string: ${value}`);
    return undefined;
  }
}

export class Store {
  public static create(name?: string): Store {
    // logger.log(`Creating store with name: ${name ?? DEFAULT_KEY}`);
    return new Store(name ?? DEFAULT_KEY);
  }

  public static get<T>(key: string, defaultValue?: T): T | typeof defaultValue {
    // logger.log(`Getting global value for key: ${key}`);
    const keys = Store.internalGetKeys();
    if (!keys.includes(key)) {
      // logger.log(`Global value for key ${key} not found`);
      return defaultValue;
    }
    const data = $prefs.valueForKey(key);
    if (data === undefined) {
      return defaultValue;
    }

    return parse<T>(data) ?? defaultValue;
  }

  public static set(key: string, value: unknown) {
    // logger.log(`Setting global value for key: ${key}`);
    $prefs.setValueForKey(JSON.stringify(value), key);
    Store.internalSetKey(key);
  }

  public static remove(key: string) {
    // logger.log(`Removing global value for key: ${key}`);
    $prefs.removeValueForKey(key);
    Store.internalRemoveKey(key);
  }

  public static clear() {
    const keys = Store.internalGetKeys();
    // logger.log("Clearing global values: ", keys);
    keys.forEach((key) => {
      $prefs.removeValueForKey(key);
    });
    $prefs.removeValueForKey(INTERNAL_KEY);
  }

  public static get entries(): Array<[key: string, value: unknown]> {
    // logger.log("Getting global entries");
    const keys = Store.internalGetKeys();
    return keys.map((key) => {
      return [key, Store.get(key)];
    });
  }

  private static getInternalData(): InternalData {
    // logger.log("Getting internal data");
    const internalData = $prefs.valueForKey(INTERNAL_KEY);
    if (!internalData)
      return {
        keys: [],
      };
    return (
      parse<InternalData>(internalData) ?? {
        keys: [],
      }
    );
  }

  private static internalGetKeys(): string[] {
    return Store.getInternalData().keys ?? [];
  }

  private static internalSetKey(key: string) {
    const internalData = Store.getInternalData();
    const keys = internalData.keys ?? [];
    keys.push(key);
    $prefs.setValueForKey(
      JSON.stringify({
        ...internalData,
        keys: Array.from(new Set(keys)),
      }),
      INTERNAL_KEY
    );
  }

  private static internalRemoveKey(key: string) {
    const internalData = Store.getInternalData();
    const keys = internalData.keys ?? [];
    const index = keys.indexOf(key);
    if (index !== -1) {
      keys.splice(index, 1);
    }
    $prefs.setValueForKey(
      JSON.stringify({
        ...internalData,
        keys: Array.from(new Set(keys)),
      }),
      INTERNAL_KEY
    );
  }

  private constructor(private name: string) {}

  private get key() {
    return `scriptwriter::${this.name}`;
  }

  get<T>(key: string, defaultValue?: T): T | undefined {
    // logger.log(`Getting value for key: ${key} from store: ${this.name}`);
    const data = Store.get<StoreValue<T>>(this.key, {})!;
    return data[key] ?? defaultValue;
  }

  set<T>(key: string, value: T) {
    // logger.log(`Setting value for key: ${key} from store: ${this.name}`);
    const data = Store.get<StoreValue<T>>(this.key, {})!;
    data[key] = value;
    Store.set(this.key, data);
  }

  remove(key: string) {
    // logger.log(`Removing value for key: ${key} from store: ${this.name}`);
    const data = Store.get<StoreValue<unknown>>(this.key, {})!;
    delete data[key];
    Store.set(this.key, data);
  }

  clear() {
    // logger.log(`Clearing store: ${this.name}`);
    Store.remove(this.key);
  }
}
