<script setup>
import { computed, ref, nextTick } from 'vue'
import { useGuide } from './useGuide'

const { state, actions, hotkeyDisplay, capabilities } = useGuide()

const sortedSteps = computed(() => state.steps)

const captureMessage = computed(() => {
  if (!state.captureNext) return ''
  return '捕获模式：点击页面元素添加步骤，按 Esc 退出。'
})

const hasSteps = computed(() => state.steps.length > 0)
const canSave = computed(() => capabilities.canSave)
const canLoad = computed(() => capabilities.canLoad)
const editorEnabled = computed(() => capabilities.enableEditor !== false)
const defaultLocale = computed(() => capabilities.defaultLocale || '')
const routeLabel = computed(() => state.activeRouteKey || '未知路由')
const statusBanner = computed(() => state.statusMessage || '')
const lastSavedLabel = computed(() => state.lastSavedAt || '—')
const stepsCount = computed(() => state.steps.length)
const progressTemplateDefault = '{{current}} of {{total}}'

const BUTTON_LABEL_MAP = {
  default: { next: 'Next', prev: 'Previous', done: 'Done' },
  'en-us': { next: 'Next', prev: 'Previous', done: 'Done' },
  'zh-cn': { next: '下一步', prev: '上一步', done: '完成' },
  zh: { next: '下一步', prev: '上一步', done: '完成' },
  'zh-tw': { next: '下一步', prev: '上一步', done: '完成' },
  'zh-hk': { next: '下一步', prev: '上一步', done: '完成' },
}

const toLocaleKey = (value) => (value || '').toLowerCase()

const getButtonDefaultsForLocale = (locale) => {
  const key = toLocaleKey(locale)
  if (BUTTON_LABEL_MAP[key]) return BUTTON_LABEL_MAP[key]
  const base = key.split('-')[0]
  if (BUTTON_LABEL_MAP[base]) return BUTTON_LABEL_MAP[base]
  return BUTTON_LABEL_MAP.default
}

const getDefaultButtonText = (step, type) => {
  const locale = step.locale || defaultLocale.value || ''
  const defaults = getButtonDefaultsForLocale(locale)
  return defaults[type] || BUTTON_LABEL_MAP.default[type]
}

const sideOptions = [
  { label: '自动', value: '' },
  { label: '顶部', value: 'top' },
  { label: '底部', value: 'bottom' },
  { label: '左侧', value: 'left' },
  { label: '右侧', value: 'right' },
  { label: '覆盖', value: 'over' },
]

const alignOptions = [
  { label: '自动', value: '' },
  { label: '开始', value: 'start' },
  { label: '居中', value: 'center' },
  { label: '末尾', value: 'end' },
]

const draggingId = ref(null)

const beginDrag = (event, id) => {
  draggingId.value = id
  if (event?.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', id)
    const card = event.target?.closest('.step-card')
    if (card) {
      const dragImageX = card.offsetWidth / 2
      const dragImageY = Math.min(32, card.offsetHeight / 3)
      event.dataTransfer.setDragImage(card, dragImageX, dragImageY)
    }
  }
}

const endDrag = () => {
  draggingId.value = null
}

const dropOn = (id) => {
  const sourceId = draggingId.value
  if (!sourceId || sourceId === id) {
    draggingId.value = null
    return
  }
  const targetIndex = state.steps.findIndex((step) => step.id === id)
  if (targetIndex === -1) {
    draggingId.value = null
    return
  }
  actions.reorderStep(sourceId, targetIndex)
  draggingId.value = null
}

const scrollToStep = (id) => {
  nextTick(() => {
    const card = document.querySelector(`[data-step-id="${id}"]`)
    if (card && card.scrollIntoView) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

if (typeof window !== 'undefined') {
  window.addEventListener('guide-step-assigned', (event) => {
    const targetId = event.detail?.stepId
    if (targetId && state.isEditing) {
      scrollToStep(targetId)
    }
  })
}

const handleTextInput = (id, field, value) => {
  if (typeof value === 'boolean') {
    actions.updateStep(id, { [field]: value })
    return
  }
  if (value === null || value === undefined) {
    actions.updateStep(id, { [field]: undefined })
    return
  }
  const trimmed = value.toString().trim()
  actions.updateStep(id, { [field]: trimmed || undefined })
}

const handleNumberInput = (id, field, value) => {
  const num = Number(value)
  if (Number.isFinite(num)) {
    actions.updateStep(id, { [field]: num })
  } else {
    actions.updateStep(id, { [field]: undefined })
  }
}

const handleSelectInput = (id, field, value, fallback) => {
  if (value) {
    actions.updateStep(id, { [field]: value })
  } else if (fallback) {
    actions.updateStep(id, { [field]: fallback })
  } else {
    actions.updateStep(id, { [field]: undefined })
  }
}

const handleScrollToggle = (id, checked) => {
  actions.updateStep(id, { scrollIntoView: checked })
}

</script>

<template>
  <teleport v-if="editorEnabled" to="body">
    <div class="guide-shell" aria-live="polite">
      <button
        v-if="!state.isEditing"
        type="button"
        class="guide-launch"
        @click="actions.toggleEditing(true)"
      >
        页面引导
      </button>

      <section v-else class="guide-panel" role="dialog" aria-modal="true">
        <header class="panel-toolbar">
          <div class="toolbar-info">
            <div class="title-line">
              <h1>页面引导配置管理</h1>
              <dl class="inline-meta">
                <div class="meta-item">
                  <dt>快捷键</dt>
                  <dd>{{ hotkeyDisplay }}</dd>
                </div>
<!--                <div class="meta-item">-->
<!--                  <dt>步骤</dt>-->
<!--                  <dd>{{ stepsCount }}</dd>-->
<!--                </div>-->
              </dl>
            </div>
            <div class="route-line">
              <span class="route-label">当前路由</span>
              <span class="route-badge">{{ routeLabel }}</span>
              <span class="route-meta">总步骤 {{ stepsCount }}</span>
              <span class="route-meta">上次保存 {{ lastSavedLabel }}</span>
            </div>
            <div class="action-row">
              <button
                type="button"
                class="btn btn--primary"
                @click="state.captureNext ? actions.cancelCapture() : actions.enterCapture()"
              >
                {{ state.captureNext ? '退出捕获' : '捕获元素' }}
              </button>
              <button
                type="button"
                class="btn"
                @click="actions.play('editor')"
                :disabled="!hasSteps || state.captureNext"
              >
                播放
              </button>
              <button
                type="button"
                class="btn"
                @click="actions.stop"
                :disabled="!state.isPlaying"
              >
                停止
              </button>
              <button
                type="button"
                class="btn"
                @click="actions.save"
                :disabled="state.captureNext || !state.dirty || !canSave"
                :title="canSave ? '' : '未配置 saveSteps，当前仅保存在内存中'"
              >
                保存
              </button>
              <button
                type="button"
                class="btn btn--ghost"
                @click="actions.reload"
                :disabled="state.captureNext || !canLoad"
                :title="canLoad ? '' : '未配置 loadSteps，无法重新加载'"
              >
                重新加载
              </button>
            </div>
          </div>
          <button
            type="button"
            class="minimize-button"
            aria-label="最小化编辑器"
            @click="actions.toggleEditing(false)"
          >
            ×
          </button>
        </header>

        <div v-if="captureMessage" class="info-banner info-banner--accent">
          {{ captureMessage }}
        </div>
        <div v-else-if="statusBanner" class="info-banner">
          {{ statusBanner }}
        </div>

        <div class="panel-main">
          <section class="steps-column">
            <p v-if="!hasSteps" class="empty-hint">
              暂无步骤。点击“捕获元素”并选择需要高亮的页面区域。
            </p>
            <ul v-else class="steps-list">
              <li
                v-for="(step, index) in sortedSteps"
                :key="step.id"
                :class="['step-card', { active: state.selectedStepId === step.id, dragging: draggingId === step.id }]"
                :data-step-id="step.id"
                @dragover.prevent
                @drop.prevent="dropOn(step.id)"
              >
                <header class="step-card__header">
                  <div class="step-card__title">
                    <span
                      class="drag-handle"
                      aria-hidden="true"
                      draggable="true"
                      @dragstart="(event) => beginDrag(event, step.id)"
                      @dragend="endDrag"
                    >
                      ⠿
                    </span>
                    <span class="step-index">{{ index + 1 }}</span>
                    <button type="button" class="step-name" @click="actions.selectStep(step.id)">
                      {{ step.title || '未命名步骤' }}
                    </button>
                  </div>
                  <div class="step-card__actions">
                    <button
                      type="button"
                      class="icon-button--plain"
                      aria-label="移除此步骤"
                      @click="actions.removeStep(step.id)"
                    >
                      ×
                    </button>
                  </div>
                </header>

                <div class="step-card__body">
                  <div class="form-grid">
                    <label class="full readonly">
                      <span>定位</span>
                      <input type="text" :value="step.selector" readonly />
                    </label>
                    <label class="full">
                      <span>标题</span>
                      <input
                        type="text"
                        :value="step.title"
                        @input="handleTextInput(step.id, 'title', $event.target.value)"
                        placeholder="步骤标题"
                      />
                    </label>
                    <label class="full">
                      <span>描述</span>
                      <textarea
                        rows="2"
                        :value="step.description"
                        @input="handleTextInput(step.id, 'description', $event.target.value)"
                        placeholder="为提示添加说明"
                      />
                    </label>
                  </div>

                  <details class="advanced">
                    <summary>高级配置</summary>
                    <div class="advanced-grid">
                      <div class="read-only-field">
                        <span class="label">引导类型</span>
                        <span class="value">Popover</span>
                      </div>
                      <label>
                        <span>Popover Side</span>
                        <select
                          :value="step.side || ''"
                          @change="handleSelectInput(step.id, 'side', $event.target.value)"
                        >
                          <option v-for="option in sideOptions" :key="option.value || 'auto'" :value="option.value">
                            {{ option.label }}
                          </option>
                        </select>
                      </label>
                      <label>
                        <span>Popover Align</span>
                        <select
                          :value="step.align || ''"
                          @change="handleSelectInput(step.id, 'align', $event.target.value)"
                        >
                          <option v-for="option in alignOptions" :key="option.value || 'auto'" :value="option.value">
                            {{ option.label }}
                          </option>
                        </select>
                      </label>
                      <label class="full">
                        <span>滚动行为</span>
                        <div class="checkbox-inline">
                          <input
                            type="checkbox"
                            :checked="step.scrollIntoView !== false"
                            @change="handleScrollToggle(step.id, $event.target.checked)"
                          />
                          <span>自动滚动到目标元素</span>
                        </div>
                      </label>
                      <label>
                        <span>延迟 (ms)</span>
                        <input
                          type="number"
                          min="0"
                          :value="typeof step.delay === 'number' ? step.delay : ''"
                          @input="handleNumberInput(step.id, 'delay', $event.target.value)"
                          placeholder="0"
                        />
                      </label>
                      <label>
                        <span>下一步按钮</span>
                        <input
                          type="text"
                          :value="step.nextBtnText || getDefaultButtonText(step, 'next')"
                          @input="handleTextInput(step.id, 'nextBtnText', $event.target.value)"
                        />
                      </label>
                      <label>
                        <span>上一步按钮</span>
                        <input
                          type="text"
                          :value="step.prevBtnText || getDefaultButtonText(step, 'prev')"
                          @input="handleTextInput(step.id, 'prevBtnText', $event.target.value)"
                        />
                      </label>
                      <label>
                        <span>完成按钮</span>
                        <input
                          type="text"
                          :value="step.doneBtnText || getDefaultButtonText(step, 'done')"
                          @input="handleTextInput(step.id, 'doneBtnText', $event.target.value)"
                        />
                      </label>
                      <label>
                        <span>自动操作</span>
                        <input
                          type="text"
                          :value="step.action || ''"
                          @input="handleTextInput(step.id, 'action', $event.target.value)"
                          placeholder="如 click / focus"
                        />
                      </label>
                      <label>
                        <span>允许关闭</span>
                        <div class="checkbox-inline">
                          <input
                            type="checkbox"
                            :checked="step.allowClose === true"
                            @change="handleTextInput(step.id, 'allowClose', $event.target.checked)"
                          />
                          <span>允许用户主动关闭提示</span>
                        </div>
                      </label>
                      <label class="full">
                        <span>进度文案模板</span>
                        <input
                          type="text"
                          :value="step.progressText || progressTemplateDefault"
                          @input="handleTextInput(step.id, 'progressText', $event.target.value)"
                        />
                      </label>
                    </div>
                  </details>

                </div>
              </li>
            </ul>
          </section>
        </div>
      </section>
    </div>
  </teleport>
</template>

<style scoped>
.guide-shell {
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
  pointer-events: none;
}

.guide-launch {
  pointer-events: auto;
  padding: 10px 18px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  font-size: 12px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.guide-launch:hover {
  background: #f3f4f6;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.guide-panel {
  pointer-events: auto;
  width: min(560px, calc(100vw - 32px));
  max-height: calc(100vh - 48px);
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  font-family: 'SF Pro Text', 'PingFang SC', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.panel-toolbar {
  position: relative;
  padding: 18px 24px 14px;
  border-bottom: 1px solid #e5e7eb;
}

.toolbar-info {
  display: grid;
  gap: 10px;
}

.title-line {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: baseline;
}

.title-line h1 {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}


.inline-meta {
  display: inline-flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #374151;
}

.meta-item {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  font-size: 12px;
  color: #475569;
}

.meta-item dt {
  font-weight: 500;
  color: #94a3b8;
}

.meta-item dd {
  margin: 0;
  font-weight: 600;
  color: #1f2937;
}


.route-line {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #374151;
}

.route-label {
  color: #94a3b8;
  font-weight: 500;
}

.route-meta {
  color: #94a3b8;
}


.action-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 4px;
}

.toolbar-info {
  display: grid;
  gap: 12px;
}

.title-line {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: baseline;
}

.title-line h1 {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.inline-meta {
  display: inline-flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #475569;
}

.meta-item {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.meta-item dt {
  font-weight: 500;
  color: #94a3b8;
}

.meta-item dd {
  margin: 0;
  font-weight: 600;
  color: #1f2937;
}

.route-line {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #475569;
}

.route-label {
  color: #94a3b8;
  font-weight: 500;
}

.action-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 4px;
}

.route-badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: #eef2ff;
  color: #374151;
  border: 1px solid #dbeafe;
}

.minimize-button {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.minimize-button:hover {
  color: #4b5563;
}

.info-banner {
  margin: 0;
  padding: 8px 24px;
  background: #f3f4f6;
  color: #374151;
  font-size: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.info-banner--accent {
  background: #ecfdf5;
  color: #047857;
}

.panel-main {
  padding: 16px 24px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}


.btn {
  padding: 8px 14px;
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  cursor: pointer;
  transition: background 0.18s ease, border 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn:hover:not(:disabled) {
  background: #f3f4f6;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}


.btn--primary {
  background: linear-gradient(180deg, #4f8efc 0%, #1d4ed8 100%);
  border-color: #3b82f6;
  color: #ffffff;
}

.btn--primary:hover:not(:disabled) {
  background: linear-gradient(180deg, #5b9afd 0%, #1e40af 100%);
  border-color: #2563eb;
}

.btn--ghost {
  background: rgba(148, 163, 184, 0.12);
}

.meta-list {
  margin: 0;
  display: grid;
  gap: 6px;
}

.meta-list div {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #475569;
}

.meta-list dd {
  margin: 0;
  font-weight: 600;
  color: #0f172a;
}

.steps-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: stretch;
  width: 100%;
}

.empty-hint {
  font-size: 13px;
  color: #64748b;
}


.steps-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  width: 100%;
  list-style: none;
  padding: 0;
  margin: 0;
}

.step-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  padding: 0;
  display: grid;
  gap: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 520px;
  cursor: grab;
  transition: box-shadow 0.18s ease, transform 0.18s ease;
}

.step-card:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.step-card.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.step-card.dragging {
  opacity: 0.6;
  cursor: grabbing;
}

.step-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: #f3f4f6;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #e5e7eb;
}

.drag-handle {
  cursor: grab;
  color: #9ca3af;
  font-size: 16px;
}

.drag-handle:active {
  cursor: grabbing;
}

.step-card__body {
  padding: 16px 18px 18px;
  display: grid;
  gap: 16px;
}

.step-card__title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-index {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.14);
  color: #1d4ed8;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.step-name {
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
}

.step-name:hover {
  color: #1d4ed8;
}


.step-card__actions {
  display: flex;
  align-items: center;
}


.icon-button--plain {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.18s ease;
}

.icon-button--plain:hover {
  color: #374151;
}


.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.form-grid label {
  display: grid;
  gap: 6px;
  font-size: 12px;
  color: #475569;
}

.form-grid label.readonly input {
  background: #f9fafb;
  color: #6b7280;
  cursor: default;
}

.form-grid label.readonly input:focus {
  border-color: #e5e7eb;
  box-shadow: none;
}

.form-grid .full {
  grid-column: 1 / -1;
}

input,
textarea,
select {
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 6px 10px;
  font-size: 13px;
  color: #0f172a;
  background: #fff;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

textarea {
  resize: vertical;
}

.advanced {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f9fafb;
  padding: 10px 12px;
}

.advanced summary {
  cursor: pointer;
  font-weight: 600;
  color: #1f2937;
}

.advanced-grid {
  display: grid;
  gap: 12px;
  margin-top: 12px;
  grid-template-columns: 1fr;
}

.advanced-grid label,
.read-only-field {
  display: grid;
  gap: 6px;
  font-size: 12px;
  color: #475569;
}

.read-only-field .value {
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(226, 232, 240, 0.6);
  border: 1px solid rgba(203, 213, 225, 0.8);
  font-weight: 600;
  color: #1f2937;
}

.full {
  grid-column: 1 / -1;
}

.checkbox-inline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #475569;
}

.checkbox-inline input[type='checkbox'] {
  width: 16px;
  height: 16px;
  accent-color: #6366f1;
}

.hint-inline {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.selector {
  font-size: 12px;
  color: #475569;
  word-break: break-all;
}

@media (max-width: 640px) {
  .guide-shell {
    right: 16px;
    bottom: 16px;
  }

}
</style>
.minimize-button {
  position: absolute;
  top: 18px;
  right: 24px;
}
.inline-meta {
  font-size: 12px;
  color: #475569;
}
