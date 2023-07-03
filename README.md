# Scriptwriters

Scriptwriters 提供一系列的工具用于 Quantumult X 脚本的开发和调试，可以像开发前端项目一样使用 `typescript` 和 `npm module` 来帮助开发脚本。

## 安装

Scriptwriters 提供两个依赖包：`@scriptwriter/cli` 和 `@scriptwriter/quantumult`，`cli` 内置了脚本的开发服务和构建功能，`quantumult` 内置了一些 API 封装。

使用 [npm](http://npmjs.com/) 安装依赖。

```bash
npm install @scriptwriter/cli --save-dev
npm install @scriptwriter/quantumult --save
```

## 开始使用

1. 创建项目文件夹

```bash
mkdir demo-scripts
```

2. 初始化 package.json

```bash
cd demo-scripts && npm init -y
```

3. 安装依赖

```bash
npm install @scriptwriter/cli --save-dev && npm install @scriptwriter/quantumult --save
```

4. 添加 `tsconfig.json`

根据自己的需求配置。

```json
{
  "compilerOptions": {
    "outDir": "./dist/",
    "noImplicitAny": true,
    "module": "es6",
    "target": "es5",
    "allowJs": false,
    "strictNullChecks": true,
    "moduleResolution": "NodeNext",
    "allowSyntheticDefaultImports": true
  }
}
```

5. 添加运行脚本

在 package.json 中添加运行脚本：

```json
  "scripts": {
    "prebuild": "rm -rf dist",
    "build": "NODE_ENV=production scriptwriter-cli build",
    "dev": "scriptwriter-cli dev"
  }
```

6. 运行开发脚本

```bash
npm run dev
```

打开控制台输出的地址，可以看到首页的效果。

## 开始你的第一个脚本

## License

[MIT](https://choosealicense.com/licenses/mit/)
