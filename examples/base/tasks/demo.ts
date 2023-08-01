import {
  Corn,
  Description,
  Icon,
  Main,
  Script,
  Title,
} from "@scriptwriter/quantumult/decorators";

@Script("task")
@Title("测试Demo")
@Corn("0 12 * * 1")
@Icon("/assets/icons/mt.png")
@Description("测试Demo，使用装饰器实现")
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Demo {
  @Main()
  handler() {
    console.log("main");
  }
}
