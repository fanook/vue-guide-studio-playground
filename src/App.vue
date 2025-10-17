<script setup>
import { computed } from 'vue'
import { useRoute, RouterView, RouterLink } from 'vue-router'
import { GuideEditorLayer } from 'vue-guide-studio'

const route = useRoute()

const navigation = [
  { name: '首页', to: '/' },
  { name: '引导流程', to: '/onboarding' },
  { name: '资源库', to: '/resources' },
  { name: '常见问题', to: '/faq' },
]

const pageTitle = computed(() => {
  const match = navigation.find((item) => item.to === route.path)
  return match ? match.name : '引导面板'
})
</script>

<template>
  <div class="layout">
    <header class="topbar">
      <RouterLink to="/" class="brand">GuideStudio Playground</RouterLink>
      <nav>
        <RouterLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          :class="{ active: route.path === item.to }"
        >
          {{ item.name }}
        </RouterLink>
      </nav>
      <span class="page-label">{{ pageTitle }}</span>
    </header>

    <main class="content">
      <RouterView />
    </main>

    <footer class="footer">
      <p>测试提示：此 Demo 仅包含静态占位数据，可在脚本中注入真实引导逻辑。</p>
      <p>节点状态或实验配置请于各页面单独维护，便于差异化测试。</p>
    </footer>

    <GuideEditorLayer />
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: grid;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(180deg, rgba(241, 245, 249, 0.9), rgba(255, 255, 255, 0.95));
}

.topbar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: space-between;
}

.brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

nav {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

nav a {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  color: rgba(30, 41, 59, 0.75);
  background: rgba(148, 163, 184, 0.15);
  transition: all 0.2s ease;
}

nav a:hover {
  color: #0f172a;
  background: rgba(148, 163, 184, 0.25);
}

nav a.active {
  background: #6366f1;
  color: #fff;
}

.page-label {
  font-size: 0.9rem;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.15);
  color: #1d4ed8;
}

.content {
  width: min(1100px, 100%);
  margin: 0 auto;
}

.footer {
  font-size: 0.85rem;
  color: rgba(30, 41, 59, 0.6);
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(148, 163, 184, 0.3);
}

@media (max-width: 640px) {
  .layout {
    padding: 1.5rem;
  }

  nav {
    width: 100%;
    justify-content: flex-start;
  }

  .page-label {
    width: 100%;
    text-align: left;
  }
}
</style>
