import { reactive, readonly, nextTick } from 'vue'
import { driver } from 'driver.js'
import GuideEditorLayer from './GuideEditorLayer.vue'
import 'driver.js/dist/driver.css'
import { GUIDE_SYMBOL } from './symbols'
import { getUniqueSelector } from './utils/getSelector'

const parseHotkey = (value = 'shift+g') => {
  const parts = value.toLowerCase().split('+').map((part) => part.trim()).filter(Boolean)
  if (!parts.length) {
    return {
      key: 'g',
      modifiers: { shiftKey: true, ctrlKey: false, altKey: false, metaKey: false },
      display: 'Shift + G',
    }
  }

  const key = parts.pop()
  const modifiers = {
    shiftKey: parts.includes('shift'),
    ctrlKey: parts.includes('ctrl') || parts.includes('control'),
    altKey: parts.includes('alt'),
    metaKey: parts.includes('meta') || parts.includes('cmd') || parts.includes('command'),
  }

  const displayParts = []
  if (modifiers.ctrlKey) displayParts.push('Ctrl')
  if (modifiers.altKey) displayParts.push('Alt')
  if (modifiers.shiftKey) displayParts.push('Shift')
  if (modifiers.metaKey) displayParts.push('⌘')
  displayParts.push(key.toUpperCase())

  return { key, modifiers, display: displayParts.join(' + ') }
}

const resolveRouteKey = (route) => {
  if (!route) return 'unknown'
  if (route.name) return String(route.name)
  if (route.path) return route.path
  return route.fullPath || 'unknown'
}

const BUTTON_LOCALE_MAP = {
  default: { next: 'Next', prev: 'Previous', done: 'Done' },
  'en-us': { next: 'Next', prev: 'Previous', done: 'Done' },
  'zh-cn': { next: '下一步', prev: '上一步', done: '完成' },
  zh: { next: '下一步', prev: '上一步', done: '完成' },
  'zh-tw': { next: '下一步', prev: '上一步', done: '完成' },
  'zh-hk': { next: '下一步', prev: '上一步', done: '完成' },
}

const resolveLocaleKey = (value) => (value || '').toLowerCase()

const getDefaultButtonsForLocale = (locale) => {
  const key = resolveLocaleKey(locale)
  if (BUTTON_LOCALE_MAP[key]) return BUTTON_LOCALE_MAP[key]
  const base = key.split('-')[0]
  if (BUTTON_LOCALE_MAP[base]) return BUTTON_LOCALE_MAP[base]
  return BUTTON_LOCALE_MAP.default
}

const DEFAULT_PROGRESS_TEXT = '{{current}} of {{total}}'

const resolveButtonTexts = (locale, step, fallbackLocale) => {
  const defaults = getDefaultButtonsForLocale(locale || fallbackLocale)
  return {
    next: step.nextBtnText || defaults.next,
    prev: step.prevBtnText || defaults.prev,
    done: step.doneBtnText || defaults.done,
  }
}

const normalizeStep = (step, index = 0, defaultLocale = 'en-US') => {
  if (!step || !step.selector) return null
  const {
    title = '',
    description = '',
    side,
    align,
    scrollIntoView,
    delay,
    highlightPadding,
    overlayOpacity,
    nextBtnText,
    prevBtnText,
    doneBtnText,
    media,
    action,
    when,
    locale,
  } = step
  const mediaValue = media && (media.type || media.src) ? { ...media } : undefined
  const resolvedLocale = locale || defaultLocale
  const resolvedScrollIntoView =
    typeof scrollIntoView === 'boolean' ? scrollIntoView : true
  return {
    id: step.id || `guide-step-${Date.now()}-${index}`,
    selector: step.selector,
    title,
    description,
    side,
    align,
    scrollIntoView: resolvedScrollIntoView,
    delay,
    highlightPadding,
    overlayOpacity,
    nextBtnText,
    prevBtnText,
    doneBtnText,
    media: mediaValue,
    action,
    when: when && typeof when === 'object' ? { ...when } : { exists: true },
    locale: resolvedLocale,
    allowClose: step.allowClose === true,
    showProgress: step.showProgress !== false,
    progressText: step.progressText || DEFAULT_PROGRESS_TEXT,
  }
}

const serializeSteps = (steps, defaultLocale) =>
  (steps || []).map((step) => {
    const {
      id,
      selector,
      title,
      description,
      side,
      align,
      scrollIntoView,
      delay,
      highlightPadding,
      overlayOpacity,
      nextBtnText,
      prevBtnText,
      doneBtnText,
      media,
      action,
      when,
      locale,
      allowClose,
      showProgress,
      progressText,
    } = step

    const payload = {
      id,
      selector,
      title,
      description,
    }

    if (side) payload.side = side
    if (align) payload.align = align
    if (scrollIntoView === false) payload.scrollIntoView = false
    if (typeof delay === 'number' && delay > 0) payload.delay = delay
    if (typeof highlightPadding === 'number') payload.highlightPadding = highlightPadding
    if (typeof overlayOpacity === 'number') payload.overlayOpacity = overlayOpacity
    if (nextBtnText) payload.nextBtnText = nextBtnText
    if (prevBtnText) payload.prevBtnText = prevBtnText
    if (doneBtnText) payload.doneBtnText = doneBtnText
    if (media && (media.type || media.src)) payload.media = { ...media }
    if (action) payload.action = action
    payload.when = when && typeof when === 'object' ? { ...when } : { exists: true }
    if (locale && locale !== defaultLocale) payload.locale = locale
    if (allowClose === true) payload.allowClose = true
    if (showProgress === false) payload.showProgress = false
    if (progressText && progressText !== DEFAULT_PROGRESS_TEXT) payload.progressText = progressText

    return payload
  })

const injectHighlightStyles = () => {
  if (typeof document === 'undefined') return
  if (document.getElementById('vue-guide-studio-highlight-style')) return

  const style = document.createElement('style')
  style.id = 'vue-guide-studio-highlight-style'
  style.innerHTML = `
    .guide-capture-mode {
      cursor: crosshair !important;
    }
    .guide-capture-outline {
      outline: 2px solid #6366f1 !important;
      outline-offset: 2px !important;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.35) !important;
    }
    .guide-selected-step {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.35) !important;
      transition: box-shadow 0.25s ease;
    }
  `
  document.head.appendChild(style)
}

export const createGuidePlugin = (rawOptions = {}) => {
  const defaultLocale =
    rawOptions.defaultLocale ||
    (typeof navigator !== 'undefined' && navigator.language
      ? navigator.language
      : 'en-US')
  
  const options = {
    hotkey: 'Shift+G',
    autoPlay: true,
    enableEditor: true,
    playOnce: false,
    loadSteps: undefined,
    saveSteps: undefined,
    loadPlayed: undefined,
    savePlayed: undefined,
    defaultLocale,
    router: null,
    ...rawOptions,
  }

  const hotkey = parseHotkey(options.hotkey)
  const loadHandler = typeof options.loadSteps === 'function' ? options.loadSteps : null
  const saveHandler = typeof options.saveSteps === 'function' ? options.saveSteps : null
  const loadPlayedHandler = typeof options.loadPlayed === 'function' ? options.loadPlayed : null
  const savePlayedHandler = typeof options.savePlayed === 'function' ? options.savePlayed : null
  const editingEnabled = options.enableEditor !== false

  const state = reactive({
    isEditing: false,
    captureNext: false,
    steps: [],
    selectedStepId: null,
    statusMessage: '',
    lastSavedAt: '',
    activeRouteKey: '',
    isPlaying: false,
    dirty: false,
  })

  const capabilities = {
    canLoad: Boolean(loadHandler),
    canSave: Boolean(saveHandler),
    enableEditor: editingEnabled,
    playOnce: Boolean(options.playOnce),
    persistPlayed: Boolean(loadPlayedHandler || savePlayedHandler),
    defaultLocale,
  }

  const memoryStore = new Map()
  const playedRoutes = new Map()
  const routeCache = new Map()

  let router = options.router || null
  let driverInstance = null
  let routeSnapshot = null
  let listenersBound = false
  let highlightedElement = null

  const hasPlayed = (routeKey) => playedRoutes.get(routeKey) === true

  const persistPlayed = (routeKey, value, { silent = false } = {}) => {
    if (!routeKey) return
    playedRoutes.set(routeKey, value)
    if (!silent && savePlayedHandler) {
      const routeForKey = routeCache.get(routeKey) || routeSnapshot
      Promise.resolve(savePlayedHandler(routeForKey, routeKey, value)).catch((error) => {
        console.error('[VueGuideStudio] 保存播放状态失败', error)
      })
    }
  }

  const markPlayed = (routeKey) => {
    if (!routeKey || hasPlayed(routeKey)) return
    persistPlayed(routeKey, true)
  }

  const ensurePlayedState = async (route, routeKey) => {
    if (!routeKey) return false
    if (playedRoutes.has(routeKey)) {
      return playedRoutes.get(routeKey)
    }
    let played = false
    if (loadPlayedHandler) {
      try {
        played = await Promise.resolve(loadPlayedHandler(route, routeKey))
      } catch (error) {
        console.error('[VueGuideStudio] 读取播放状态失败', error)
      }
    }
    persistPlayed(routeKey, Boolean(played), { silent: true })
    return playedRoutes.get(routeKey)
  }

  const captureHighlight = {
    current: null,
    add(element) {
      if (!element) return
      if (this.current && this.current !== element) {
        this.current.classList.remove('guide-capture-outline')
      }
      this.current = element
      this.current.classList.add('guide-capture-outline')
    },
    clear() {
      if (this.current) {
        this.current.classList.remove('guide-capture-outline')
        this.current = null
      }
    },
  }

  const syncMemory = () => {
    if (!state.activeRouteKey) return
    memoryStore.set(state.activeRouteKey, serializeSteps(state.steps, defaultLocale))
  }

  const setStatus = (message) => {
    state.statusMessage = message
  }

  const ensureDriver = () => {
    if (driverInstance) return driverInstance
    driverInstance = driver({
      animate: true,
      showProgress: true,
      allowClose: false,
      overlayOpacity: 0.65,
      overlayClickBehavior: 'close',
      stageBackground: 'rgba(15,23,42,0.75)',
      onDestroyed() {
        state.isPlaying = false
      },
    })
    return driverInstance
  }

  const setSteps = (steps) => {
    const normalized = (steps || [])
      .map((step, index) => normalizeStep(step, index, defaultLocale))
      .filter(Boolean)

    state.steps = normalized
    if (!normalized.length) {
      state.selectedStepId = null
    }
    syncMemory()
  }

  const refreshRouteState = async (route) => {
    if (!route) return
    const routeKey = resolveRouteKey(route)
    routeSnapshot = route
    state.activeRouteKey = routeKey
    routeCache.set(routeKey, route)

    const alreadyPlayed = await ensurePlayedState(route, routeKey)

    if (loadHandler) {
      try {
        const payload = await Promise.resolve(loadHandler(route, routeKey))
        setSteps(payload)
        state.dirty = false
        setStatus(`已加载 ${state.steps.length} 个步骤`)
        const shouldAutoPlay =
          options.autoPlay &&
          state.steps.length > 0 &&
          !state.isEditing &&
          !(options.playOnce && alreadyPlayed)
        if (shouldAutoPlay) {
          actions.play('auto')
        }
      } catch (error) {
        console.error('[VueGuideStudio] 加载步骤失败', error)
        setStatus('加载步骤失败，请检查 loadSteps 实现')
      }
      return
    }

    const cached = memoryStore.get(routeKey) || []
    setSteps(cached)
    state.dirty = false
    setStatus(cached.length ? `已载入内存中的 ${cached.length} 个步骤` : '未配置 loadSteps，当前使用空步骤')
    const shouldAutoPlay =
      options.autoPlay &&
      state.steps.length > 0 &&
      !state.isEditing &&
      !(options.playOnce && alreadyPlayed)
    if (shouldAutoPlay) {
      actions.play('auto')
    }
  }

  const exitCaptureMode = () => {
    state.captureNext = false
    captureHighlight.clear()
    if (typeof document !== 'undefined') {
      document.body.classList.remove('guide-capture-mode')
    }
    setStatus('')
  }

  const applySelectedClass = (selector) => {
    if (highlightedElement) {
      highlightedElement.classList.remove('guide-selected-step')
      highlightedElement = null
    }
    if (selector) {
      const element = document.querySelector(selector)
      if (element) {
        element.classList.add('guide-selected-step')
        highlightedElement = element
        setTimeout(() => {
          element.classList.remove('guide-selected-step')
          if (highlightedElement === element) {
            highlightedElement = null
          }
        }, 1200)
      }
    }
  }

  const actions = {
    toggleEditing(force) {
      if (!editingEnabled) return
      const nextValue = typeof force === 'boolean' ? force : !state.isEditing
      state.isEditing = nextValue
      if (!nextValue) {
        exitCaptureMode()
      }
      if (!nextValue && state.isPlaying) {
        actions.stop()
      }
      if (!nextValue) {
        setStatus('')
      }
    },
    enterCapture() {
      if (!editingEnabled) return
      state.captureNext = true
      setStatus('点击目标元素以创建新步骤')
      if (typeof document !== 'undefined') {
        document.body.classList.add('guide-capture-mode')
      }
      state.isEditing = false
    },
    cancelCapture() {
      if (!editingEnabled) return
      exitCaptureMode()
    },
    addStep(payload) {
      if (!editingEnabled) return
      const base = {
        ...payload,
        when: { exists: true },
        locale: payload.locale || defaultLocale,
        scrollIntoView: typeof payload.scrollIntoView === 'boolean' ? payload.scrollIntoView : true,
        type: 'popover',
        allowClose: payload.allowClose === true,
        showProgress: payload.showProgress !== false,
        progressText: payload.progressText || DEFAULT_PROGRESS_TEXT,
      }
      const normalized = normalizeStep(base, state.steps.length, defaultLocale)
      if (!normalized) return
      state.steps = [...state.steps, normalized]
      state.selectedStepId = normalized.id
      state.dirty = true
      syncMemory()
      state.isEditing = true
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('guide-step-assigned', {
            detail: { stepId: normalized.id },
          }),
        )
      }
    },
    updateStep(id, patch) {
      if (!editingEnabled) return
      state.steps = state.steps.map((step) =>
        step.id === id ? { ...step, ...patch } : step,
      )
      state.dirty = true
      syncMemory()
    },
    removeStep(id) {
      if (!editingEnabled) return
      state.steps = state.steps.filter((step) => step.id !== id)
      if (state.selectedStepId === id) {
        state.selectedStepId = state.steps[0]?.id || null
      }
      state.dirty = true
      syncMemory()
    },
    selectStep(id) {
      if (!editingEnabled) return
      state.selectedStepId = id
      const step = state.steps.find((item) => item.id === id)
      if (step) {
        nextTick(() => {
          applySelectedClass(step.selector)
          const node = document.querySelector(step.selector)
          if (node && node.scrollIntoView) {
            node.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        })
      }
    },
    moveStep(id, delta) {
      if (!editingEnabled) return
      const index = state.steps.findIndex((step) => step.id === id)
      if (index === -1) return
      const targetIndex = index + delta
      if (targetIndex < 0 || targetIndex >= state.steps.length) return
      const stepsClone = [...state.steps]
      const [item] = stepsClone.splice(index, 1)
      stepsClone.splice(targetIndex, 0, item)
      state.steps = stepsClone
      state.dirty = true
      syncMemory()
    },
    reorderStep(id, targetIndex) {
      if (!editingEnabled) return
      const fromIndex = state.steps.findIndex((step) => step.id === id)
      if (fromIndex === -1) return
      const boundedIndex = Math.max(0, Math.min(targetIndex, state.steps.length - 1))
      if (fromIndex === boundedIndex) return
      const stepsClone = [...state.steps]
      const [item] = stepsClone.splice(fromIndex, 1)
      stepsClone.splice(boundedIndex, 0, item)
      state.steps = stepsClone
      state.dirty = true
      syncMemory()
    },
    async save() {
      if (!routeSnapshot) return
      if (!saveHandler) {
        state.dirty = false
        setStatus('未配置 saveSteps，步骤仅保存在内存中')
        return
      }
      try {
        const plainSteps = serializeSteps(state.steps, defaultLocale)
        await Promise.resolve(saveHandler(routeSnapshot, state.activeRouteKey, plainSteps))
        state.dirty = false
        state.lastSavedAt = new Date().toLocaleTimeString()
        syncMemory()
        setStatus('保存成功')
      } catch (error) {
        console.error('[VueGuideStudio] 保存步骤失败', error)
        setStatus('保存失败，请检查 saveSteps 实现')
      }
    },
    async reload() {
      if (!routeSnapshot) return
      if (!loadHandler) {
        setStatus('未配置 loadSteps，无法重新加载')
        return
      }
      await refreshRouteState(routeSnapshot)
    },
    play(origin = 'manual') {
      if (!state.steps.length) {
        setStatus('暂无步骤可播放')
        return
      }
      if (state.captureNext) {
        setStatus('捕获模式中，请先完成或取消捕获')
        return
      }
      const candidates = state.steps.filter((step) => {
        if (step.when?.exists) {
          return Boolean(document.querySelector(step.selector))
        }
        return true
      })

      if (!candidates.length) {
        setStatus('未找到可播放的步骤，请检查选择器或显示条件')
        return
      }

      const api = ensureDriver()
      const totalSteps = candidates.length
      const steps = candidates.map((step, index) => {
      const popover = {
        title: step.title || '引导提示',
        description: step.description || '',
      }

        const { next, prev, done } = resolveButtonTexts(
          step.locale,
          step,
          defaultLocale,
        )
        popover.nextBtnText = next
        popover.prevBtnText = prev
        popover.doneBtnText = done

        if (step.side) popover.side = step.side
        if (step.align) popover.align = step.align

        const stepConfig = {
          element: step.selector,
          popover,
        }

        if (typeof step.highlightPadding === 'number') {
          stepConfig.padding = step.highlightPadding
        }

        if (typeof step.overlayOpacity === 'number') {
          stepConfig.overlayOpacity = step.overlayOpacity
        }

        const buttons = ['next', 'previous']
        if (step.allowClose === true) {
          buttons.push('close')
        }
        popover.showButtons = buttons

        const showProgress = step.showProgress !== false
        if (showProgress) {
          const template = (step.progressText || DEFAULT_PROGRESS_TEXT)
            .replace('{{current}}', String(index + 1))
            .replace('{{total}}', String(totalSteps))
          popover.showProgress = true
          popover.progressText = template
        } else {
          popover.showProgress = false
        }

        const shouldScroll = step.scrollIntoView !== false
        const action = step.action
        const delay = typeof step.delay === 'number' && step.delay > 0 ? step.delay : 0

        stepConfig.onHighlighted = (element) => {
          if (shouldScroll && element?.scrollIntoView) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
          }

          if (!action) return

          const runAction = () => {
            if (!element) return
            if (action === 'click' && typeof element.click === 'function') {
              element.click()
            } else if (action === 'focus' && typeof element.focus === 'function') {
              element.focus({ preventScroll: true })
            }
          }

          if (delay) {
            setTimeout(runAction, delay)
          } else {
            runAction()
          }
        }

        return stepConfig
      })
      try {
        if (api.isActive()) {
          api.destroy()
        }
        api.setConfig({
          animate: true,
          showProgress: true,
          allowClose: false,
          overlayOpacity: 0.65,
          overlayClickBehavior: 'close',
          stageBackground: 'rgba(15,23,42,0.75)',
          onDestroyed() {
            state.isPlaying = false
          },
        })
        api.setSteps(steps)
        api.drive(0)
        state.isPlaying = true
        if (options.playOnce && origin !== 'editor' && state.activeRouteKey) {
          markPlayed(state.activeRouteKey)
        }
      } catch (error) {
        console.error('[VueGuideStudio] 播放失败', error)
        setStatus('播放失败，检查选择器是否可访问')
      }
    },
    stop() {
      if (driverInstance && driverInstance.isActive()) {
        try {
          driverInstance.destroy()
        } catch (error) {
          console.warn('[VueGuideStudio] 停止播放时出错', error)
        }
      }
      state.isPlaying = false
    },
    resetPlayed(routeKey) {
      const key = routeKey || state.activeRouteKey
      if (!key) return
      persistPlayed(key, false)
    },
    hasPlayed(routeKey) {
      const key = routeKey || state.activeRouteKey
      return key ? hasPlayed(key) : false
    },
  }

  const handleHotkey = (event) => {
    if (!editingEnabled) return
    if (!hotkey.key) return
    if (event.key?.toLowerCase() !== hotkey.key) return
    if (hotkey.modifiers.shiftKey && !event.shiftKey) return
    if (hotkey.modifiers.ctrlKey && !event.ctrlKey) return
    if (hotkey.modifiers.altKey && !event.altKey) return
    if (hotkey.modifiers.metaKey && !event.metaKey) return

    const target = event.target
    const tagName = target?.tagName
    if (tagName && ['input', 'textarea'].includes(tagName.toLowerCase())) {
      return
    }

    event.preventDefault()
    actions.toggleEditing()
  }

  const handleKeydown = (event) => {
    if (event.key === 'Escape' && state.captureNext) {
      event.preventDefault()
      actions.cancelCapture()
      return
    }
    handleHotkey(event)
  }

  const handleClick = (event) => {
    if (!editingEnabled || !state.captureNext) return
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    const selector = getUniqueSelector(event.target)
    if (!selector) {
      setStatus('未能生成唯一选择器，请为元素添加 id 或唯一类名')
      actions.cancelCapture()
      return
    }
    actions.addStep({ selector })
    setStatus(`已添加步骤 (${selector})`)
    exitCaptureMode()
  }

  const handleMouseover = (event) => {
    if (!editingEnabled || !state.captureNext) return
    captureHighlight.add(event.target)
  }

  const handleMouseout = () => {
    if (!editingEnabled || !state.captureNext) return
    captureHighlight.clear()
  }

  const bindListeners = () => {
    if (!editingEnabled) return
    if (listenersBound || typeof document === 'undefined') return
    listenersBound = true
    document.addEventListener('keydown', handleKeydown, true)
    document.addEventListener('click', handleClick, true)
    document.addEventListener('mouseover', handleMouseover, true)
    document.addEventListener('mouseout', handleMouseout, true)
  }

  const install = (app) => {
    if (editingEnabled) {
      injectHighlightStyles()
      bindListeners()
    }

    if (!router) {
      router = options.router || app.config.globalProperties.$router || null
    }

    if (router) {
      router.isReady().then(() => {
        const current = router.currentRoute?.value || router.currentRoute
        refreshRouteState(current)
      })

      router.afterEach((to) => {
        actions.stop()
        refreshRouteState(to)
      })
    } else {
      console.warn('[VueGuideStudio] 未检测到 router，自动加载功能不可用')
    }

    const context = {
      state: readonly(state),
      actions,
      hotkeyDisplay: hotkey.display,
      capabilities,
    }

    app.component('GuideEditorLayer', GuideEditorLayer)
    app.provide(GUIDE_SYMBOL, context)
  }

  return { install }
}
