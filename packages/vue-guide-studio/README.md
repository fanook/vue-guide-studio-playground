# vue-guide-studio

Vue GuideStudio：基于 Driver.js 的 Vue 页面引导插件，内置可视化编辑器，支持路由切换自动播放、热键开启编辑、步骤捕获与自定义持久化。

## 特性

- 🔦 Driver.js 聚焦与气泡提示
- 🎛️ 可视化编辑器：捕获元素、排序、配置文案
- 🔁 路由切换自动加载 / 播放控制
- 💾 自定义保存 / 读取步骤与播放记录
- 🧩 仅依赖 `vue@3` 与 `driver.js`

## 快速开始

```bash
npm install vue-guide-studio driver.js
```

```js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createGuidePlugin } from 'vue-guide-studio'

const guide = createGuidePlugin({
  router,
  loadSteps: async (route, key) => {/* 获取步骤 */},
  saveSteps: async (route, key, steps) => {/* 保存步骤 */},
})

createApp(App).use(router).use(guide).mount('#app')
```

更多参数与扩展，请查看源码内注释。

## 配置项

- `showEntryButton`：默认 `true`。控制是否渲染编辑器入口按钮，设为 `false` 时页面上不会出现“页面引导”入口，只能通过快捷键或调用 `actions.toggleEditing(true)` 唤出面板。
- `playedVersion`：默认 `null`（继续使用布尔标记）。当设置为字符串、数字或返回标记值的函数时，插件会将该标记作为“已播放”记录。修改标记即可让已播放的路由重新播放引导；函数签名为 `(route, routeKey) => string | number | boolean`。你也可以在 `loadPlayed` 中返回 `{ mark: 'v1' }` 或 `{ version: 'v1' }` 这样的对象，插件会自动读取标记。
- `savePlayed(route, routeKey, mark, meta)`：第三个参数会在启用 `playedVersion` 时传入对应的版本（未设置时为布尔值），第四个参数包含 `{ mark, matched, token }` 等元信息，便于你将版本化的播放状态持久化。
- `loadPlayed(route, routeKey)`：可返回布尔值、版本值，或携带 `mark`/`version` 字段的对象以兼容旧数据。

## 运行时动作

- `actions.hasPlayed(routeKey?)` 依旧返回布尔值，但会结合 `playedVersion` 判断是否需要重新播放。
- `actions.getPlayedMark(routeKey?)` 可读取当前缓存的播放标记，便于调试或在自定义界面中展示。
