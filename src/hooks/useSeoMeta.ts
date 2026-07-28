import { useEffect } from 'react';
import type { Language } from '@/types/i18n';

const META: Record<Language, {
  htmlLang: string;
  title: string;
  description: string;
  ogLocale: string;
  canonical: string;
}> = {
  ko: {
    htmlLang: 'ko',
    title: 'GAMERS.lol — LoL 5v5 팀 밸런서',
    description: '리그 오브 레전드 5vs5 내전 팀 자동 밸런싱 툴. 소환사 10명의 티어와 라인 선호도를 기반으로 최적 팀 구성을 자동으로 계산합니다.',
    ogLocale: 'ko_KR',
    canonical: 'https://gamers-lol.vercel.app/ko',
  },
  ja: {
    htmlLang: 'ja',
    title: 'GAMERS.lol — LoL 5v5 チームバランサー',
    description: 'リーグ・オブ・レジェンド 5v5 内戦チーム自動バランシングツール。10名の召喚士のランクとレーン希望に基づき最適なチーム構成を自動計算します。',
    ogLocale: 'ja_JP',
    canonical: 'https://gamers-lol.vercel.app/ja',
  },
};

/**
 * Dynamically updates <html lang>, <title>, <meta description>,
 * <meta og:*>, and <link canonical> based on current language.
 */
export function useSeoMeta(lang: Language) {
  useEffect(() => {
    const meta = META[lang];

    // Update <html lang>
    document.documentElement.lang = meta.htmlLang;

    // Update <title>
    document.title = meta.title;

    // Update or create <meta name="description">
    setMetaName('description', meta.description);

    // Update Open Graph tags
    setMetaProperty('og:title', meta.title);
    setMetaProperty('og:description', meta.description);
    setMetaProperty('og:locale', meta.ogLocale);
    setMetaProperty('og:url', meta.canonical);

    // Update Twitter
    setMetaName('twitter:title', meta.title);
    setMetaName('twitter:description', meta.description);

    // Update canonical
    setLinkRel('canonical', meta.canonical);
  }, [lang]);
}

function setMetaName(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setMetaProperty(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkRel(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}
