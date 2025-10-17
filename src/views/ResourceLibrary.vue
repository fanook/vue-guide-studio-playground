<script setup>
const categories = [
  {
    name: '快速入门',
    description: '适用于首次接触 Vue 的用户，提供动手教程与引导脚本例程。',
    resources: [
      { title: '组件拆分指南', format: '文章', duration: '5 分钟', link: '#' },
      { title: '首屏首登脚本样例', format: '代码片段', duration: '10 分钟', link: '#' },
    ],
  },
  {
    name: '埋点与数据',
    description: '帮助你校验事件上报、转化追踪与漏斗分析。',
    resources: [
      { title: '埋点枚举清单', format: '表格', duration: '下载', link: '#' },
      { title: '引导漏斗模板', format: 'Dashboard', duration: '15 分钟', link: '#' },
    ],
  },
  {
    name: 'A/B 实验',
    description: '测试不同引导策略时使用，附上实验埋点与对照组策略。',
    resources: [
      { title: '实验设计 Checklist', format: '文章', duration: '7 分钟', link: '#' },
      { title: '实验事件映射表', format: 'CSV', duration: '下载', link: '#' },
    ],
  },
]

const quickActions = [
  { label: '同步最新引导脚本', icon: '⇅' },
  { label: '查看埋点监控面板', icon: '📈' },
  { label: '导出用户画像样例', icon: '🧑‍🤝‍🧑' },
  { label: '测试多语言提示文案', icon: '🈯' },
]
</script>

<template>
  <div class="library">
    <section class="overview">
      <h1>资源库</h1>
      <p>
        将常用的引导策略、埋点脚本与实验模板集中在此，方便测试时快速查阅或复制。
      </p>
      <div class="actions">
        <button v-for="action in quickActions" :key="action.label" type="button">
          <span class="icon">{{ action.icon }}</span>
          <span>{{ action.label }}</span>
        </button>
      </div>
    </section>

    <section class="category-grid">
      <article v-for="category in categories" :key="category.name">
        <header>
          <h2>{{ category.name }}</h2>
          <p>{{ category.description }}</p>
        </header>
        <ul>
          <li v-for="item in category.resources" :key="item.title">
            <div>
              <h3>{{ item.title }}</h3>
              <span class="meta">{{ item.format }} · {{ item.duration }}</span>
            </div>
            <a :href="item.link">查看</a>
          </li>
        </ul>
      </article>
    </section>

    <section class="callout">
      <h2>测试建议</h2>
      <p>
        若需在页面中注入引导提示，可将整段数据通过 props 传递至共用提示组件，或使用状态管理保存当前资源索引。
      </p>
      <p>
        当前链接仅为占位，实际跳转请在逻辑层注入真实地址或执行下载动作。
      </p>
    </section>
  </div>
</template>

<style scoped>
.library {
  display: grid;
  gap: 2.5rem;
}

.overview h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.overview p {
  max-width: 640px;
  color: rgba(30, 41, 59, 0.75);
}

.actions {
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.actions button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  border: 1px solid rgba(59, 130, 246, 0.25);
  background: rgba(219, 234, 254, 0.45);
  color: #1d4ed8;
  font-weight: 600;
  cursor: pointer;
}

.icon {
  font-size: 1.1rem;
}

.category-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.category-grid article {
  padding: 1.75rem;
  border-radius: 18px;
  background: #fff;
  border: 1px solid rgba(203, 213, 225, 0.6);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
}

.category-grid header h2 {
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
}

.category-grid header p {
  color: rgba(30, 41, 59, 0.7);
  margin-bottom: 1rem;
}

.category-grid ul {
  list-style: none;
  display: grid;
  gap: 1rem;
}

.category-grid li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

.category-grid li:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.category-grid h3 {
  font-size: 1rem;
}

.meta {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.85rem;
  color: rgba(71, 85, 105, 0.9);
}

a {
  color: #2563eb;
  font-weight: 600;
}

.callout {
  padding: 1.75rem;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.1));
  color: rgba(15, 23, 42, 0.85);
  display: grid;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .actions {
    flex-direction: column;
    align-items: stretch;
  }

  .category-grid li {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
