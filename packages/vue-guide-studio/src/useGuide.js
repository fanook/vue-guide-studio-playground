import { inject } from 'vue'
import { GUIDE_SYMBOL } from './symbols'

export const useGuide = () => {
  const context = inject(GUIDE_SYMBOL, null)
  if (!context) {
    throw new Error('Vue GuideStudio 插件未安装或未在应用中初始化。')
  }
  return context
}
