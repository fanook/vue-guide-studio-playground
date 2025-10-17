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
