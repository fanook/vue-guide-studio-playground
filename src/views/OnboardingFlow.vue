<script setup>
const stages = [
  {
    id: 'step-01',
    title: '欢迎弹窗',
    goal: '展示关键信息并引导用户完成主任务。',
    recommendation: '使用首登标识判定是否展示，并附加延迟关闭策略。',
  },
  {
    id: 'step-02',
    title: '功能导览',
    goal: '通过 3-5 个焦点提示引导用户完成关键设置。',
    recommendation: '结合指引箭头或高亮遮罩，记录每一步的完成状态。',
  },
  {
    id: 'step-03',
    title: '新手任务',
    goal: '引导用户提交首个学习计划，收集内容偏好。',
    recommendation: '提供跳过和稍后提醒选项，适配不同引导强度。',
  },
]

const personas = [
  {
    label: '首登新用户',
    description: '需要从零开始体验，包含欢迎、导览、任务三套流程。',
  },
  {
    label: '回访用户',
    description: '曾经完成欢迎阶段，需要跳转至任务卡片并触发唤醒提示。',
  },
  {
    label: '高价值用户',
    description: '已配置完整资料，请重点推荐高级资源与客服引导。',
  },
]

const checkpoints = [
  '读取后端返回的 onboardingFlag，决定默认展示步骤。',
  '在每次步骤完成后写入事件 (eventName: onboarding_step_completed)。',
  '用户手动关闭时记录 closeReason，并决定二次唤起间隔。',
]
</script>

<template>
  <div class="page">
    <header class="intro">
      <h1>引导流程试验台</h1>
      <p>
        此页列出多个阶段模块与用户画像，便于你在逻辑脚本中切换流程路径、观测状态更新。
      </p>
      <div class="persona-bar">
        <div v-for="persona in personas" :key="persona.label" class="persona">
          <h2>{{ persona.label }}</h2>
          <p>{{ persona.description }}</p>
        </div>
      </div>
    </header>

    <section class="stage-board">
      <h2>阶段拆解</h2>
      <ol>
        <li v-for="stage in stages" :key="stage.id">
          <div class="stage-header">
            <span class="stage-index">{{ stage.id }}</span>
            <div>
              <h3>{{ stage.title }}</h3>
              <p>{{ stage.goal }}</p>
            </div>
          </div>
          <div class="stage-body">
            <p class="hint">提示：{{ stage.recommendation }}</p>
            <button type="button">模拟进入此阶段</button>
            <button type="button" class="secondary">标记为完成</button>
          </div>
        </li>
      </ol>
    </section>

    <section class="checkpoint">
      <h2>逻辑检查点</h2>
      <ul>
        <li v-for="item in checkpoints" :key="item">{{ item }}</li>
      </ul>
    </section>

    <section class="cta-area">
      <aside>
        <h3>占位表单</h3>
        <p>在此嵌入引导配置表单，比如选择权重、触达渠道、延迟策略等。</p>
        <form @submit.prevent>
          <label>
            推送优先级
            <select>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </label>
          <label>
            下一次提醒（分钟）
            <input type="number" min="0" step="5" placeholder="30" />
          </label>
          <label class="checkbox">
            <input type="checkbox" />
            允许在移动端同步提醒
          </label>
          <button type="submit">保存策略（占位）</button>
        </form>
      </aside>
      <div class="rich-card">
        <h3>测试建议</h3>
        <ul>
          <li>配合浏览器控制台，输出当前步骤与用户画像，以确认逻辑分支。</li>
          <li>调用 `router.push` 或 `router.replace` 来模拟跳转后流程是否恢复。</li>
          <li>记录埋点上报的 payload，在网络面板中核对字段。</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: 2.5rem;
  padding-bottom: 4rem;
}

.intro h1 {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.persona-bar {
  margin-top: 1.5rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.persona {
  border-radius: 16px;
  padding: 1.25rem;
  background: rgba(59, 130, 246, 0.08);
}

.persona h2 {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.stage-board {
  border-radius: 20px;
  padding: 2rem;
  background: #fff;
  box-shadow: 0 16px 35px rgba(15, 23, 42, 0.08);
}

.stage-board h2 {
  margin-bottom: 1.5rem;
}

.stage-board ol {
  list-style: none;
  display: grid;
  gap: 1.75rem;
  counter-reset: stage;
}

.stage-board li {
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.9), rgba(255, 255, 255, 0.95));
}

.stage-header {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.stage-index {
  width: 82px;
  flex-shrink: 0;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8rem;
  color: #7c3aed;
}

.stage-body {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
  align-items: center;
}

.stage-body button {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  background: #6366f1;
  color: #fff;
  transition: background 0.2s;
}

.stage-body button:hover {
  background: #4f46e5;
}

.stage-body .secondary {
  background: rgba(30, 64, 175, 0.1);
  color: #1e3a8a;
}

.hint {
  flex: 1 1 100%;
  font-size: 0.9rem;
  color: rgba(15, 23, 42, 0.7);
}

.checkpoint {
  border: 1px dashed rgba(71, 85, 105, 0.3);
  border-radius: 16px;
  padding: 1.75rem;
  background: rgba(14, 165, 233, 0.08);
}

.checkpoint ul {
  display: grid;
  gap: 0.75rem;
  list-style: disc;
  margin-left: 1.25rem;
}

.cta-area {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.cta-area aside,
.rich-card {
  border-radius: 18px;
  padding: 1.75rem;
  background: #fff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

form {
  display: grid;
  gap: 1rem;
}

label {
  display: grid;
  gap: 0.4rem;
  font-size: 0.9rem;
}

select,
input[type='number'] {
  padding: 0.55rem 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.6);
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

form button {
  align-self: start;
  padding: 0.55rem 1.4rem;
  border-radius: 999px;
  border: none;
  background: #0ea5e9;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.rich-card ul {
  list-style: decimal;
  margin-left: 1.25rem;
  display: grid;
  gap: 0.65rem;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .stage-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .stage-body {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
