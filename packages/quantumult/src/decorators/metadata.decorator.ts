import {
  CommentMeta,
  CornMeta,
  DescriptionMeta,
  HostMeta,
  IconMeta,
  MethodMeta,
  ScriptMeta,
  TagMeta,
  TitleMeta,
  UrlMeta,
  VersionMeta,
} from "./keys";

const createMappingDecorator =
  (type: string) =>
  (metadata: string): ClassDecorator => {
    return (target) => {
      Reflect.defineMetadata(type, metadata, target);
    };
  };

export const Script = createMappingDecorator(ScriptMeta);
export const Tag = createMappingDecorator(TagMeta);
export const Icon = createMappingDecorator(IconMeta);
export const Title = createMappingDecorator(TitleMeta);
export const Corn = createMappingDecorator(CornMeta);
export const Description = createMappingDecorator(DescriptionMeta);
export const Host = createMappingDecorator(HostMeta);
export const Url = createMappingDecorator(UrlMeta);
export const Method = createMappingDecorator(MethodMeta);
export const Version = createMappingDecorator(VersionMeta);
export const Comment = createMappingDecorator(CommentMeta);
