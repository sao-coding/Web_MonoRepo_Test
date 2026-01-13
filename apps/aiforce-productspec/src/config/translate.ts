import { getAppConfig } from '@msi/config/env'

const config = getAppConfig()

export const AppConfig = {
  appId: 'ai_4',
  appApiUrl:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8000/api'
      : 'http://10.16.20.156:7474/api',
  serviceApiUrl: config.NEXT_PUBLIC_NIM_SERVICE_API_URL || 'https://api.msi.com.tw'
}

// 支援的語系：英語(en)、捷克語(cs)、丹麥語(da)、德語(de)、希臘語(el)、
// 西班牙語(es)、芬蘭語(fi)、法語(fr)、匈牙利語(hu)、義大利語(it)、
// 立陶宛語(lt)、拉脫維亞語(lv)、荷蘭語(nl)、挪威語(no)、波蘭語(pl)、
// 葡萄牙語(pt)、羅馬尼亞語(ro)、俄語(ru)、斯洛伐克語(sk)、瑞典語(sv)、
// 簡體中文(zh)、日語(ja)、印地語(hi)、韓語(ko)、愛沙尼亞語(et)、
// 斯洛維尼亞語(sl)、保加利亞語(bg)、烏克蘭語(uk)、克羅埃西亞語(hr)、
// 阿拉伯語(ar)、越南語(vi)、土耳其語(tr)、印尼語(id)
export const translateConfig = {
  languages: [
    { label: '英語', code: 'en' },
    { label: '中文', code: 'zh' },
    { label: '捷克語', code: 'cs' },
    { label: '丹麥語', code: 'da' },
    { label: '德語', code: 'de' },
    { label: '希臘語', code: 'el' },
    { label: '西班牙語', code: 'es' },
    { label: '芬蘭語', code: 'fi' },
    { label: '法語', code: 'fr' },
    { label: '匈牙利語', code: 'hu' },
    { label: '義大利語', code: 'it' },
    { label: '立陶宛語', code: 'lt' },
    { label: '拉脫維亞語', code: 'lv' },
    { label: '荷蘭語', code: 'nl' },
    { label: '挪威語', code: 'no' },
    { label: '波蘭語', code: 'pl' },
    { label: '葡萄牙語', code: 'pt' },
    { label: '羅馬尼亞語', code: 'ro' },
    { label: '俄語', code: 'ru' },
    { label: '斯洛伐克語', code: 'sk' },
    { label: '瑞典語', code: 'sv' },
    { label: '日語', code: 'ja' },
    { label: '印地語', code: 'hi' },
    { label: '韓語', code: 'ko' },
    { label: '愛沙尼亞語', code: 'et' },
    { label: '斯洛維尼亞語', code: 'sl' },
    { label: '保加利亞語', code: 'bg' },
    { label: '烏克蘭語', code: 'uk' },
    { label: '克羅埃西亞語', code: 'hr' },
    { label: '阿拉伯語', code: 'ar' },
    { label: '越南語', code: 'vi' },
    { label: '土耳其語', code: 'tr' },
    { label: '印尼語', code: 'id' }
  ],
  default_source_language: { label: '英語', code: 'en' },
  default_target_language: { label: '簡體中文', code: 'zh' }
}
