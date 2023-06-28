import { parse, tokenizers } from "comment-parser";

import { PACKAGE, getScriptwriterConfig } from "../common/constant.js";
import { urlJoin } from "../common/helper.js";

const TASK = "task";
const REWRITE = "rewrite";

const types = [TASK, REWRITE];

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
  | "version";

type Meta = Record<MetaKey, string>;

export class Script {
  static create(meta: Meta, resource: string) {
    if (meta.type === TASK) {
      return new Task(meta, resource);
    } else if (meta.type === REWRITE) {
      return new Rewrite(meta, resource);
    }
    return new Script(meta, resource);
  }

  constructor(public meta: Meta, public resource: string) {}

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

    return `脚本名称：${this.meta.title || this.meta.tag}
脚本作者：${config.author ?? PACKAGE.author?.name ?? PACKAGE.author ?? "匿名"}
脚本版本：${this.meta.version || "1.0.0"}
更新时间：${new Date().toLocaleString()}
脚本说明：${this.meta.description ?? ""}`;
  }

  getLicense(): string {
    const config = getScriptwriterConfig();
    return `${config?.license}\n❤️ Powered by Scriptwriter(https://github.com/oustn/scriptwriters.git)`;
  }
}

export class Task extends Script {
  constructor(public meta: Meta, public resource: string) {
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

    if (this.meta.enable) {
      record += `, enable=${this.meta.enable}`;
    }

    return record;
  }

  getComment(): string {
    return `${super.getComment()}

[task_local]
${this.formatScript()}

${super.getLicense()}
`;
  }
}

export class Rewrite extends Script {
  constructor(public meta: Meta, public resource: string) {
    super(meta, resource);
  }

  get hosts() {
    return Array.from(new Set(this.meta.host.split(",").map((d) => d.trim())));
  }

  isValid(): boolean {
    return !!(this.meta.host && this.meta.url && this.meta.rewrite);
  }

  formatRecord() {
    return `${this.meta.url} url ${this.meta.rewrite} ${this.resource}`;
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

[rewrite_local]
${this.meta.url} url ${this.meta.rewrite} ${this.resource}

[mitm]
hostname = ${this.hosts.join(", ")}

${super.getLicense()}
`;
  }
}

export function parseMeta(
  code: string,
  resource: string,
  host: string
): Script | undefined {
  const blocks = parse(code, {
    tokenizers: [tokenizers.tag(), tokenizers.description("compact")],
  });

  if (!Array.isArray(blocks) || blocks.length === 0) {
    return;
  }

  const scriptComment = blocks.find((item) =>
    item.tags.some(
      (tag) => tag.tag === "script" && types.includes(tag.description)
    )
  );
  if (!scriptComment) {
    return;
  }
  const meta = scriptComment.tags.reduce((prev, curr) => {
    prev[(curr.tag === "script" ? "type" : curr.tag) as MetaKey] =
      curr.description;
    if (curr.tag === "icon") {
      prev["icon"] = urlJoin(host, prev.icon);
    }
    return prev;
  }, {} as Record<MetaKey, string>) as Meta;

  return Script.create(meta, resource);
}
