import fs from "fs-extra";
import path from "path";
import { parse, tokenizers } from "comment-parser";

import {
  PACKAGE,
  getScriptwriterConfig,
  ICON_DIR,
  ROOT,
} from "../common/constant.js";
import { urlJoin } from "../common/helper.js";
import { getTypedFiles } from "../common/resolver.js";

const TASK = "task";
const REWRITE = "rewrite";
const ICON = "icon";

const types = [TASK, REWRITE, ICON];

const BANK = Array(50).fill("*").join("");

const CORN_REG =
  /^(\*|[0-5]?\d)(\/[0-5]?\d)?(\s+(\*|[01]?\d|2[0-3])(\/[01]?\d|2[0-3])?){4}$/;

type MetaKey =
  | "type"
  | "tag"
  | "title"
  | "icon"
  | "corn"
  | "description"
  | "host"
  | "url"
  | "method"
  | "rewrite"
  | "enable"
  | "version"
  | "comment"
  | "value";

export type Meta = Record<MetaKey, string | string[]>;

export class Script {
  static create(meta: Meta, resource: string, appendMetas?: Meta[]) {
    if (meta.type === TASK) {
      return new Task(meta, resource);
    } else if (meta.type === REWRITE) {
      return new Rewrite(meta, resource, appendMetas);
    } else if (meta.type === ICON) {
      return new Icon(meta, resource);
    }
    return new Script(meta, resource);
  }

  type = "common";

  constructor(
    public meta: Meta,
    public resource: string,
  ) {}

  isValid() {
    return false;
  }

  format(): string {
    if (!this.isValid()) return "";

    return this.formatScript();
  }

  formatScript(): string {
    return "";
  }

  getComment(): string {
    const config = getScriptwriterConfig();

    const customComment =
      Array.isArray(this.meta.comment) && this.meta.comment.length > 0
        ? `\n${this.meta.comment.join("\n")}`
        : "";

    return `脚本名称：${this.meta.title || this.meta.tag}
脚本作者：${config.author ?? PACKAGE.author?.name ?? PACKAGE.author ?? "匿名"}
脚本版本：${this.meta.version || "1.0.0"}
更新时间：${new Date().toLocaleString()}
脚本说明：${this.meta.description ?? ""}${customComment}\n`;
  }

  getLicense(): string {
    const config = getScriptwriterConfig();
    return `${config?.license}\n❤️ Powered by Scriptwriter(https://github.com/oustn/scriptwriters.git)`;
  }
}

export class Task extends Script {
  type = "task";

  constructor(
    public meta: Meta,
    public resource: string,
  ) {
    super(meta, resource);
  }

  isValid() {
    return !!(this.meta.corn && this.meta.tag);
  }

  formatScript(): string {
    let record = `${this.meta.corn} ${this.resource}`;
    if (this.meta.icon) {
      record += `, img-url=${this.meta.icon}`;
    }

    const tag = this.meta.tag || this.meta.title;
    if (tag) {
      record += `, tag=${tag}`;
    }

    return record;
  }

  getComment(): string {
    return `${super.getComment()}
${
  CORN_REG.test(this.meta.corn as string)
    ? `https://crontab.guru/#${(this.meta.corn as string).replace(
        /\s/g,
        "_",
      )}\n`
    : ""
}
${super.getLicense()}

|${BANK}
|
|[task_local]
|${this.formatScript()}, enable=true
|
|${BANK}
`;
  }
}

export class Rewrite extends Script {
  type = "rewrite";

  constructor(
    public meta: Meta,
    public resource: string,
    public appendMetas?: Meta[],
  ) {
    super(meta, resource);
  }

  get hosts() {
    const meta = [this.meta, ...(this.appendMetas ?? [])];
    return Array.from(
      new Set(
        meta
          .map((d) => (d.host as string).split(",").map((d) => d.trim()))
          .flat(),
      ),
    );
  }

  isValid(): boolean {
    return !!(this.meta.host && this.meta.url && this.meta.rewrite);
  }

  private appendFormatRecord() {
    if (!this.appendMetas?.length) return "";
    return `\n${this.appendMetas
      .map(
        (meta) =>
          `${meta.url} url ${meta.rewrite} ${meta.value ?? this.resource}`,
      )
      .join("\n")}`;
  }

  formatRecord() {
    return `${this.meta.url} url ${this.meta.rewrite} ${
      this.meta.value ?? this.resource
    }${this.appendFormatRecord()}`;
  }

  formatScript(): string {
    const record = this.formatRecord();

    if (this.hosts.length <= 0) return record;
    return `hostname = ${this.hosts.join(", ")}

${record}
    `;
  }

  getComment(): string {
    return `${super.getComment()}
${super.getLicense()}

|${BANK}
|
|[rewrite_local]
|${this.meta.url} url ${this.meta.rewrite} ${this.meta.value ?? this.resource}${
      this.appendMetas?.length
        ? `\n${this.appendMetas
            .map(
              (meta) =>
                `|${meta.url} url ${meta.rewrite} ${
                  meta.value ?? this.resource
                }`,
            )
            .join("\n")}`
        : ""
    }
|
|[mitm]
|hostname = ${this.hosts.join(", ")}
|
|${BANK}
`;
  }
}

export class Icon extends Script {
  constructor(
    public meta: Meta,
    public resource: string,
  ) {
    super(meta, resource);
  }
}

export function parseMeta(
  code: string,
  resource: string,
  host: string,
): Script | undefined {
  const blocks = parse(code, {
    tokenizers: [tokenizers.tag(), tokenizers.description("compact")],
  });

  if (!Array.isArray(blocks) || blocks.length === 0) {
    return;
  }

  const scriptComment = blocks.find((item) =>
    item.tags.some(
      (tag) => tag.tag === "script" && types.includes(tag.description),
    ),
  );
  if (!scriptComment) {
    return;
  }
  const meta = scriptComment.tags.reduce((prev, curr) => {
    const key = curr.tag === "script" ? "type" : (curr.tag as MetaKey);
    if (Array.isArray(prev[key])) {
      (prev[key] as string[]).push(curr.description);
      return prev;
    }
    prev[(curr.tag === "script" ? "type" : curr.tag) as MetaKey] =
      curr.description;
    if (curr.tag === "icon") {
      prev["icon"] = urlJoin(host, prev.icon as string);
    } else if (curr.tag === "comment") {
      if (!Array.isArray(prev["comment"])) {
        prev["comment"] = [prev["comment"]];
      }
    }
    return prev;
  }, {} as Meta) as Meta;

  if (scriptComment.description) {
    meta.title = scriptComment.description;
  }

  // 支持多个
  const appendScriptComments = blocks.filter((item) => {
    return (
      item !== scriptComment && item.tags.some((tag) => tag.tag === "script")
    );
  });

  const appendMetas = appendScriptComments.map((item) => {
    return item.tags.reduce((prev, curr) => {
      const key = curr.tag === "script" ? "type" : (curr.tag as MetaKey);
      if (Array.isArray(prev[key])) {
        (prev[key] as string[]).push(curr.description);
        return prev;
      }
      prev[(curr.tag === "script" ? "type" : curr.tag) as MetaKey] =
        curr.description;
      if (curr.tag === "icon" || curr.tag === "comment") {
        return prev;
      }
      return prev;
    }, {} as Meta) as Meta;
  });

  return Script.create(meta, resource, appendMetas);
}

export function parseIcon(host: string): Script[] {
  if (!fs.existsSync(ICON_DIR)) {
    return [];
  }
  const icons = getTypedFiles(ICON_DIR, ".png");
  return icons.map((icon) => {
    const relative = path.relative(ROOT, icon);
    return Script.create(
      {
        type: ICON,
        title: path
          .relative(ICON_DIR, icon)
          .replace(/\.png$/, "")
          .replace(/\//g, "."),
      } as Meta,
      urlJoin(host, relative),
    );
  });
}
