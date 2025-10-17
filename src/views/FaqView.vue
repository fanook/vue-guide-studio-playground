<script setup>
const faqs = [
  {
    question: '如何接入真实引导逻辑？',
    answer:
      '在你的 store 或 composable 中读取后端状态，并根据返回值决定 router 导航或提示展示。此页面的折叠组件可用于验证结构。',
  },
  {
    question: '是否支持多语言引导？',
    answer:
      '可以，将文案抽离到字典文件或后端配置，在组件中使用 computed 选择对应语言。',
  },
  {
    question: '如何校验埋点是否正确发送？',
    answer:
      '在浏览器开发者工具的 Network 面板过滤关键字或使用埋点 SDK 的调试模式，并结合资源库中的埋点枚举表。',
  },
]

const escalations = [
  {
    title: '反馈渠道',
    desc: '将截图和复现步骤同步至飞书群组 #onboarding-support。',
  },
  {
    title: '紧急回滚',
    desc: '若引导阻断核心路径，可使用 LaunchDarkly 开关关闭新手流程。',
  },
  {
    title: '灰度策略',
    desc: '推荐先在 10% 用户中实验，通过埋点指标确认无异常后再全量发布。',
  },
]
</script>

<template>
  <div class="faq">
    <header class="header">
      <h1>常见问题</h1>
      <p>这里收集了一些接入引导逻辑时的疑点，可根据需要扩展或接入在线客服。</p>
    </header>

    <section class="accordion">
      <details v-for="item in faqs" :key="item.question" open>
        <summary>{{ item.question }}</summary>
        <p>{{ item.answer }}</p>
      </details>
    </section>

    <section class="escalation">
      <h2>升级处理指引</h2>
      <div class="grid">
        <article v-for="item in escalations" :key="item.title">
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.faq {
  display: grid;
  gap: 2.5rem;
}

.header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.accordion {
  display: grid;
  gap: 1rem;
}

details {
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  padding: 1rem 1.5rem;
  background: #fff;
  box-shadow: 0 12px 20px rgba(15, 23, 42, 0.04);
}

summary {
  cursor: pointer;
  list-style: none;
  font-weight: 600;
  position: relative;
  padding-right: 1.5rem;
}

summary::marker {
  content: '';
}

summary::after {
  content: '⌄';
  position: absolute;
  right: 0;
  top: 0;
  font-size: 1rem;
  transform: rotate(0deg);
  transition: transform 0.2s ease;
}

details[open] summary::after {
  transform: rotate(180deg);
}

details p {
  margin-top: 0.75rem;
  color: rgba(15, 23, 42, 0.75);
}

.escalation {
  border-radius: 18px;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(249, 115, 22, 0.12));
  color: rgba(67, 20, 7, 0.9);
}

.escalation h2 {
  margin-bottom: 1.25rem;
}

.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

article {
  padding: 1.25rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.75);
  box-shadow: 0 10px 20px rgba(146, 64, 14, 0.08);
}

article h3 {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}
</style>
