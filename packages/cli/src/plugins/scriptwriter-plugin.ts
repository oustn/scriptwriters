import webpack, { Compiler } from "webpack";
import path from "node:path";
import sources, { Source } from "webpack-sources";
import { parseMeta, Script, Task, Rewrite } from "./comment-parser.js";
import { PACKAGE, getDevHost } from "../common/constant.js";
import { urlJoin } from "../common/helper.js";

const { Compilation } = webpack;
const { ReplaceSource, ConcatSource } = sources;

const PLUGIN = "ScriptwriterPlugin";

interface ScriptwriterPluginOptions {
  name?: string;
  description?: string;
  host?: string;
  taskSubscribe?: string;
  rewriteSubscribe?: string;
}

type Cached = WeakMap<Source, { source: Source; comment: string }>;

const wrapComment = (str: string) => {
  return `/*!\n * ${str
    .replace(/\*\//g, "* /")
    .split("\n")
    .join("\n * ")
    .replace(/\s+\n/g, "\n")
    .trimEnd()}\n */`;
};

export class ScriptwriterPlugin {
  options: ScriptwriterPluginOptions;

  constructor(options: ScriptwriterPluginOptions = {}) {
    this.options = {
      taskSubscribe: "tasks.json",
      rewriteSubscribe: "rewrites.conf",
      ...options,
    };
  }

  private getHost(dev: boolean) {
    return dev || !this.options.host ? getDevHost() : this.options.host;
  }

  private getResource(file: string, dev: boolean) {
    const host = this.getHost(dev);
    return urlJoin(host, file);
  }

  apply(compiler: Compiler) {
    const cache: Map<string, Script> = new Map();

    const commentCache: Cached = new WeakMap();

    compiler.hooks.compilation.tap(PLUGIN, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        () => {
          const isDev = compiler.options.mode === "development";
          const host = this.getHost(isDev);

          for (const chunk of compilation.chunks) {
            if (!chunk.canBeInitial()) {
              continue;
            }

            for (const file of chunk.files) {
              const name = `${PACKAGE.name}::${path.basename(
                file,
                path.extname(file)
              )}`; // tasks.hello

              compilation.updateAsset(file, (old) => {
                const code = old.source().toString();

                const script = parseMeta(
                  code,
                  this.getResource(file, isDev),
                  host
                );
                if (script) {
                  cache.set(file, script);
                }

                let replacement = "";
                const search = /Store\.create\s*\((\s*)?\)/.exec(code);
                if (search) {
                  replacement = `Store.create('${name}')}`;
                } else {
                  return this.insertComment<typeof old>(
                    old,
                    commentCache,
                    script
                  );
                }
                const source = new ReplaceSource(old as Source);
                const index = search.index;
                source.replace(
                  index,
                  index + search[0].length - 1,
                  replacement
                );
                return this.insertComment<typeof old>(
                  source as typeof old,
                  commentCache,
                  script
                );
              });
            }
          }
        }
      );

      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN,
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
        },
        (assets) => {
          if (Object.keys(assets).length === 0) return;
          const taskMeta = JSON.stringify(
            this.generateTaskGallery(cache),
            null,
            2
          );
          compilation.emitAsset(
            this.options.taskSubscribe!,
            new webpack.sources.RawSource(taskMeta, false)
          );

          const rewriteMeta = this.generateRewriteGallery(cache);
          for (const rewrite of rewriteMeta) {
            const [file, content] = rewrite;
            if (!content) continue;
            compilation.emitAsset(
              file,
              new webpack.sources.RawSource(content, false)
            );
          }
        }
      );
    });
  }

  private insertComment<T>(source: T, cache: Cached, script?: Script): T {
    if (!script || !script.isValid()) return source;
    const comment = wrapComment(script.getComment());
    const cached = cache.get(source as Source);
    if (!cached || cached.comment !== comment) {
      const newSource = new ConcatSource(comment, "\n\n", source as Source);
      cache.set(source as Source, { source: newSource, comment });
      return newSource as T;
    }
    return cached.source as T;
  }

  private generateTaskGallery(cache: Map<string, Script>) {
    const tasks = Array.from(cache.values()).filter(
      (script) => script instanceof Task
    );

    return {
      name: this.options.name ?? PACKAGE.name ?? "Scriptwriter Tasks",
      description:
        this.options.description ??
        PACKAGE.description ??
        "Tasks powered by Scriptwriter",
      task: tasks.map((task) => task.format()).filter(Boolean),
    };
  }

  private generateRewriteGallery(cache: Map<string, Script>) {
    const rewrites = Array.from(cache.entries()).filter(
      (script) => script[1] instanceof Rewrite
    );
    const rewriteMap = new Map<string, string>();
    const hosts = new Set();
    const records: string[] = [];
    rewrites.forEach(([file, script]) => {
      const record = script.format();
      rewriteMap.set(file.replace(path.extname(file), ".conf"), record);
      records.push((script as Rewrite).formatRecord());
      (script as Rewrite).hosts.forEach((host) => hosts.add(host));
    });
    rewriteMap.set(
      this.options.rewriteSubscribe!,
      `${
        hosts.size > 0 ? `hostname = ${Array.from(hosts).join(", ")}\n\n` : ""
      }${records.join("\n")}`
    );
    return rewriteMap;
  }
}
