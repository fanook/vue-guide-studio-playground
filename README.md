# vue-guide-studio-playground

这是 `vue-guide-studio` 插件的演示与开发仓库，基于 Vue 3 + Vite 构建。

## 环境要求

- Node.js ≥ 20.19（推荐 22.12+）
- npm 10+

## 安装依赖

```sh
npm install
```

## 本地开发

```sh
npm run dev
```

## 构建站点

```sh
npm run build
```

## 构建 `vue-guide-studio` 插件包

```sh
npm run build:plugin
```

命令会在 `packages/vue-guide-studio/dist` 输出可发布的库文件，使用时记得额外引入 `vue-guide-studio/style.css`。

### 发布 `vue-guide-studio` 插件到 npm

1. **准备环境**：确保使用 Node.js ≥ 20.19（建议 22.12+），并执行一次 `npm install` 安装依赖。
2. **登录 npm**：若本机尚未登录，运行 `npm login` 并按照提示输入用户名、密码与 OTP，可用 `npm whoami` 验证登录状态。
3. **更新版本号**：在根目录执行 `npm version <patch|minor|major> --workspace vue-guide-studio`，例如 `npm version patch --workspace vue-guide-studio`。这一步会同步更新 `packages/vue-guide-studio/package.json` 中的版本。
4. **构建产物**：运行 `npm run build:plugin`，确认 `packages/vue-guide-studio/dist` 下生成 `vue-guide-studio.(mjs|cjs|css)` 文件。
5. **可选 - 打包预览**：使用 `npm pack --workspace vue-guide-studio` 查看即将发布的 tarball，并确认其中只包含预期文件（命令会在根目录生成一个 `.tgz` 包，检查后可删除）。
6. **发布到 npm**：执行 `npm publish --workspace vue-guide-studio --access public`。成功后控制台会打印新版本号与包地址。
7. **验证发布**：可以使用 `npm info vue-guide-studio version` 或在其他项目中安装 `npm install vue-guide-studio@latest` 验证是否可用。

> 注意：npm 默认不允许重复发布相同版本，因此每次发布前都需要递增版本号。若想自动化发布，可在 CI 中复用以上命令序列。
