<script setup>
const quickLinks = [
  {
    title: '开始引导流程',
    description: '预览多阶段引导页面，验证状态持久化与权限分支。',
    to: '/onboarding',
    intent: 'primary',
  },
  {
    title: '资源库导航',
    description: '检查分组内容与快速筛选行动的引导表现。',
    to: '/resources',
    intent: 'secondary',
  },
  {
    title: '常见问题',
    description: '验证 FAQ 折叠、回到顶部等行为的提示文本。',
    to: '/faq',
    intent: 'ghost',
  },
]

const checkList = [
  '确认访客是否完成欢迎页 CTA。',
  '记录引导跳转时的 query 参数和埋点。',
  '测试移动端导航在 375px 下的展示。',
]

const announcement = {
  title: '新手引导实验版',
  body: '当前版本仅用于流程引导测试，真实接口请在脚本内替换 Mock 数据。',
  owner: '体验策略组',
}
</script>

<template>
  <section class="hero">
    <div>
      <p class="tag">引导运营面板</p>
      <h1>欢迎来到 GuideStudio Playground</h1>
      <p class="lead">
        这里提供多种页面骨架，帮助你快速测试首登引导、二次唤起和资源推荐等逻辑。
      </p>
      <div class="actions">
        <RouterLink
          v-for="link in quickLinks"
          :key="link.to"
          :to="link.to"
          class="action"
          :data-intent="link.intent"
        >
          <span class="action__title">{{ link.title }}</span>
          <span class="action__desc">{{ link.description }}</span>
        </RouterLink>
      </div>
    </div>
    <div class="panel">
      <h2>{{ announcement.title }}</h2>
      <p>{{ announcement.body }}</p>
      <footer>负责人：{{ announcement.owner }}</footer>
    </div>
  </section>

  <section class="checklist">
    <h2>今日自检清单</h2>
    <ul>
      <li v-for="item in checkList" :key="item">
        <span class="bullet" aria-hidden="true">✓</span>
        <span>{{ item }}</span>
      </li>
    </ul>
  </section>

  <section class="preview-grid">
    <article>
      <h3>阶段卡片</h3>
      <p>用于展示多阶段任务，可在 Onboarding 页面扩展事件埋点。</p>
      <RouterLink to="/onboarding" class="link">查看流程</RouterLink>
    </article>
    <article>
      <h3>资源位推荐</h3>
      <p>模拟内容标签、分组筛选，支持引导提示模块的 AI 推荐逻辑。</p>
      <RouterLink to="/resources" class="link">浏览资源</RouterLink>
    </article>
    <article>
      <h3>帮助与反馈</h3>
      <p>在 FAQ 中补充快捷反馈按钮，观察用户是否主动求助。</p>
      <RouterLink to="/faq" class="link">查看 FAQ</RouterLink>
    </article>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  gap: 2rem;
  align-items: start;
  padding: 2.5rem;
  border-radius: 24px;
  background: linear-gradient(135deg, #ebf4ff 0%, #fef6fb 100%);
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.75rem;
  border-radius: 999px;
  background: rgba(46, 144, 250, 0.1);
  color: #2563eb;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
}

.lead {
  margin-top: 0.75rem;
  color: rgba(30, 41, 59, 0.8);
  max-width: 560px;
}

.actions {
  margin-top: 1.5rem;
  display: grid;
  gap: 0.75rem;
}

.action {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  border: 1px solid rgba(30, 64, 175, 0.1);
  background: #fff;
  color: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.action[data-intent='primary'] {
  border-color: rgba(79, 70, 229, 0.35);
  background: rgba(255, 255, 255, 0.9);
}

.action[data-intent='secondary'] {
  border-color: rgba(236, 72, 153, 0.25);
}

.action[data-intent='ghost'] {
  border-style: dashed;
}

.action:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.1);
}

.action__title {
  font-weight: 600;
}

.action__desc {
  font-size: 0.85rem;
  color: rgba(15, 23, 42, 0.65);
}

.panel {
  padding: 1.75rem;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
}

.panel h2 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.panel footer {
  margin-top: 1.25rem;
  font-size: 0.85rem;
  color: rgba(71, 85, 105, 0.9);
}

.checklist {
  margin-top: 3rem;
  padding: 2rem;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.08), rgba(45, 212, 191, 0.08));
}

.checklist h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.checklist ul {
  list-style: none;
  display: grid;
  gap: 0.75rem;
}

.bullet {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.75rem;
  border-radius: 999px;
  background: #0ea5e9;
  color: white;
  font-size: 0.85rem;
}

.checklist li {
  display: flex;
  align-items: center;
  color: rgba(15, 23, 42, 0.85);
}

.preview-grid {
  margin-top: 3rem;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.preview-grid article {
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(203, 213, 225, 0.8);
  background: #fff;
}

.preview-grid h3 {
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
}

.link {
  display: inline-flex;
  margin-top: 0.75rem;
  color: #2563eb;
  font-weight: 600;
}

@media (max-width: 640px) {
  .hero {
    padding: 1.75rem;
  }

  .actions {
    grid-template-columns: 1fr;
  }
}
</style>
