import './assets/main.css'
import 'vue-guide-studio/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { createGuidePlugin } from 'vue-guide-studio'

const GUIDE_STORAGE_KEY = 'vuelearn.guide.steps'
const GUIDE_PLAYED_KEY = 'vuelearn.guide.played'

const readGuideCache = () => {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(GUIDE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (error) {
    console.warn('[GuideDemo] 读取引导缓存失败', error)
    return {}
  }
}

const writeGuideCache = (data) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(GUIDE_STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('[GuideDemo] 写入引导缓存失败', error)
  }
}

const readPlayedCache = () => {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(GUIDE_PLAYED_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (error) {
    console.warn('[GuideDemo] 读取播放缓存失败', error)
    return {}
  }
}

const writePlayedCache = (data) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(GUIDE_PLAYED_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('[GuideDemo] 写入播放缓存失败', error)
  }
}

const hashSteps = (steps) => {
  const payload = Array.isArray(steps) ? steps : []
  if (!payload.length) return 'empty'
  const serialized = JSON.stringify(payload)
  let hash = 0
  for (let index = 0; index < serialized.length; index += 1) {
    hash = (hash * 31 + serialized.charCodeAt(index)) >>> 0
  }
  return `v${hash.toString(16)}`
}

const resolvePlayedMark = (routeKey) => {
  const cache = readGuideCache()
  const steps = cache[routeKey] || []
  return hashSteps(steps)
}

const guidePlugin = createGuidePlugin({
  router,
  hotkey: 'Shift+G',
  enableEditor: true,
  playOnce: true,
  playedVersion: (_route, routeKey) => resolvePlayedMark(routeKey),
  loadSteps: (_route, routeKey) => {
    const cache = readGuideCache()
    return cache[routeKey] || []
  },
  saveSteps: (_route, routeKey, steps) => {
    const cache = readGuideCache()
    cache[routeKey] = steps
    writeGuideCache(cache)
  },
  loadPlayed: (_route, routeKey) => {
    const cache = readPlayedCache()
    const value = cache[routeKey]
    if (value === undefined || value === null) return false
    if (typeof value === 'object') return value
    return { mark: value }
  },
  savePlayed: (_route, routeKey, mark, meta) => {
    const cache = readPlayedCache()
    const payload = meta?.mark ?? mark
    if (payload) {
      cache[routeKey] = payload
    } else {
      delete cache[routeKey]
    }
    writePlayedCache(cache)
  },
})

createApp(App).use(router).use(guidePlugin).mount('#app')
