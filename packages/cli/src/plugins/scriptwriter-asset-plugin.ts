import path from "node:path";
import fs from "fs-extra";
import type { Compiler, Compilation } from "webpack";
import webpack from "webpack";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import FlagDependencyUsagePlugin from "webpack/lib/FlagDependencyUsagePlugin.js";
import sources, { Source } from "webpack-sources";
import deepExtend from "deep-extend";

import { getTypescriptFiles } from "../common/resolver.js";
import { Entry } from "../common/types.js";
import { getDevHost, PACKAGE } from "../common/constant.js";
import { parseMeta, Rewrite, Script, Task, Meta } from "./comment-parser.js";
import { urlJoin } from "../common/helper.js";

const PLUGIN = "ScriptwriterAssetPlugin";
const { existsSync, statSync } = fs;
const { Compilation: CompilationClass } = webpack;
const { ReplaceSource, ConcatSource } = sources;

export interface ScriptwriterAssetPluginOptions {
  includes: string[]; // the entries
  host: string; // host for assets
  task: {
    filename: string;
    title: string;
    description: string;
  };
  rewrite: {
    filename: string;
  };
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

export class ScriptwriterAssetPlugin {
  static defaultOptions: ScriptwriterAssetPluginOptions = {
    includes: ["rewrites", "tasks"],
    host: getDevHost(),
    task: {
      filename: "tasks.json",
      title: "自动化任务",
      description: "",
    },
    rewrite: {
      filename: "rewrites.conf",
    },
  };

  private options: ScriptwriterAssetPluginOptions;

  private logger?: ReturnType<Compiler["getInfrastructureLogger"]>;

  constructor(options?: Partial<ScriptwriterAssetPluginOptions>) {
    this.options = deepExtend(
      {},
      ScriptwriterAssetPlugin.defaultOptions,
      options || {},
    );
  }

  apply(compiler: Compiler) {
    this.logger = compiler.getInfrastructureLogger(PLUGIN);

    const cache: Map<string, Script> = new Map();

    const commentCache: Cached = new WeakMap();

    // todo remove
    compiler.hooks.initialize.tap(PLUGIN, () => {
      const { options } = this;

      this.options.includes = this.resolveIncludes(
        options.includes,
        compiler.context,
      );
    });

    compiler.hooks.make.tapAsync(PLUGIN, async (compilation, callback) => {
      const { options } = this;
      const outputOptions = {
        filename: "[name].js",
        path: path.resolve(compiler.context, "dist"),
      } as Parameters<Compilation["createChildCompiler"]>[1];

      const childCompiler = compilation.createChildCompiler(
        PLUGIN,
        outputOptions,
      );

      childCompiler.context = compiler.context;
      childCompiler.inputFileSystem = compiler.inputFileSystem;
      childCompiler.outputFileSystem = compiler.outputFileSystem;

      childCompiler.hooks.afterPlugins.call(childCompiler);

      cache.clear();

      const entries = this.resolveEntries(options.includes, compiler.context);

      const EntryPlugin = webpack.EntryPlugin;

      entries.forEach((entry) => {
        new EntryPlugin(childCompiler.context, entry.import, {
          name: entry.id,
          filename: entry.filename,
        }).apply(childCompiler);
      });

      new FlagDependencyUsagePlugin(true).apply(childCompiler);

      compilation.hooks.additionalAssets.tapAsync(
        PLUGIN,
        (childProcessDone) => {
          childCompiler.hooks.compilation.tap(PLUGIN, (compilation) => {
            compilation.hooks.processAssets.tap(
              {
                name: PLUGIN,
                stage: CompilationClass.PROCESS_ASSETS_STAGE_ADDITIONS,
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
                      path.extname(file),
                    )}`; // tasks.hello

                    compilation.updateAsset(file, (old) => {
                      const code = old.source().toString();

                      const script = parseMeta(
                        code,
                        this.getResource(file, isDev),
                        host,
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
                          script,
                        );
                      }
                      const source = new ReplaceSource(old as Source);
                      const index = search.index;
                      source.replace(
                        index,
                        index + search[0].length - 1,
                        replacement,
                      );
                      return this.insertComment<typeof old>(
                        source as typeof old,
                        commentCache,
                        script,
                      );
                    });
                  }
                }
              },
            );

            compilation.hooks.processAssets.tap(
              {
                name: PLUGIN,
                stage: CompilationClass.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
              },
              (assets) => {
                if (Object.keys(assets).length === 0) return;
                const taskMeta = JSON.stringify(
                  this.generateTaskGallery(cache),
                  null,
                  2,
                );
                compilation.emitAsset(
                  this.options.task.filename,
                  new webpack.sources.RawSource(taskMeta, false),
                );

                const rewriteMeta = this.generateRewriteGallery(cache);
                for (const rewrite of rewriteMeta) {
                  const [file, content] = rewrite;
                  if (!content) continue;
                  compilation.emitAsset(
                    file,
                    new webpack.sources.RawSource(content, false),
                  );
                }

                const isDev = compiler.options.mode === "development";
                const host = this.getHost(isDev);

                const metadata = this.generateMetadata(cache, host);
                compilation.emitAsset(
                  "api/metadata.json",
                  new webpack.sources.RawSource(
                    JSON.stringify(metadata, null, 2),
                    false,
                  ),
                );
              },
            );
          });

          childCompiler.runAsChild((err, entries, childCompilation) => {
            if (err) {
              return childProcessDone(err);
            }

            if (childCompilation && childCompilation.errors.length > 0) {
              return childProcessDone(childCompilation.errors[0]);
            }

            childProcessDone();
          });
        },
      );
      callback();
    });
  }

  private resolveIncludes(includes: string[] | undefined, context: string) {
    if (!includes || includes.length <= 0) return [];
    const resolved = includes.map((include) => path.resolve(context, include));
    return resolved.filter(
      (dir: string) => existsSync(dir) && statSync(dir).isDirectory(),
    );
  }

  private resolveEntries(sources: string[], context: string) {
    const entries: Entry[] = [];

    for (const source of sources) {
      const files = getTypescriptFiles(source);
      files.forEach((file) => {
        const relative = path.relative(context, file);
        const name = relative.replace(/\.ts$/, "").replace(/\//g, ".");
        entries.push({
          id: name,
          import: file,
          filename: relative.replace(/\.ts$/, ".js"),
        });
      });
    }
    return entries;
  }

  private getHost(dev: boolean) {
    return dev || !this.options.host ? getDevHost() : this.options.host;
  }

  private getResource(file: string, dev: boolean) {
    const host = this.getHost(dev);
    return urlJoin(host, file);
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
      (script) => script instanceof Task,
    );

    return {
      name: this.options.task.title ?? "Scriptwriter Tasks",
      description:
        this.options.task.description ?? "Tasks powered by Scriptwriter",
      task: tasks.map((task) => task.format()).filter(Boolean),
    };
  }

  private generateRewriteGallery(cache: Map<string, Script>) {
    const rewrites = Array.from(cache.entries()).filter(
      (script) => script[1] instanceof Rewrite,
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
      this.options.rewrite.filename,
      `${
        hosts.size > 0 ? `hostname = ${Array.from(hosts).join(", ")}\n\n` : ""
      }${records.join("\n")}`,
    );
    return rewriteMap;
  }

  private generateMetadata(cache: Map<string, Script>, host: string) {
    const tasks: Array<Meta & { resource: string }> = [];
    const rewrites: Array<Meta & { resource: string }> = [];

    Array.from(cache.values()).forEach((script) => {
      if (script instanceof Task) {
        tasks.push({
          ...script.meta,
          resource: script.resource,
        });
      } else if (script instanceof Rewrite) {
        rewrites.push({
          ...script.meta,
          resource: script.resource,
        });
      }
    });

    return {
      task: {
        name: this.options.task.title ?? "Scriptwriter Tasks",
        description:
          this.options.task.description ?? "Tasks powered by Scriptwriter",
        gallery: urlJoin(host, this.options.task.filename),
        tasks,
      },
      rewrite: {
        gallery: urlJoin(host, this.options.rewrite.filename),
        rewrites,
      },
    };
  }
}
