import type { ParsedRiotId } from '@/types/balancer';
import type { Language } from '@/types/i18n';

/**
 * Parses raw text based on the selected language (ko/ja) rules.
 * - Korean (ko): Extracts Name#Tag from "Name#Tag님이 들어왔습니다" / "Name#Tag님이 로비에 참가했습니다" or plain "Name#Tag"
 * - Japanese (ja): Extracts Name#Tag from "Name#Tagが参加しました。" / "Name#Tagがロビーに参加しました。" / "Name#Tagが入室しました。" or plain "Name#Tag"
 */
export function parseLobbyLog(text: string, lang: Language = 'ko'): ParsedRiotId[] {
  const lines = text.split('\n');
  const results: ParsedRiotId[] = [];
  const seen = new Set<string>();

  // Language specific regex patterns
  // KO regex: matches Name#Tag followed by Korean join text or end of token
  const koJoinRegex = /^([^\s#]+)#([^\s#\n.,!?]+?)(?:님이\s*(?:들어왔습니다|로비에\s*참가했습니다|방에\s*입장하셨습니다|\.?))?$/i;

  // JA regex: matches Name#Tag followed by Japanese join text or end of token
  const jaJoinRegex = /^([^\s#]+)#([^\s#\n.,!?]+?)(?:が\s*(?:参加しました|ロビーに参加しました|入室しました|\.?))?$/i;

  // Fallback pattern for loose inline match
  const fallbackRegex = /([^\s#]+)#([^\s#\n.,!?]+)/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let gameName: string | null = null;
    let tagLine: string | null = null;

    if (lang === 'ja') {
      const matchJa = jaJoinRegex.exec(trimmed);
      if (matchJa) {
        gameName = matchJa[1].trim();
        tagLine = matchJa[2].replace(/が.*$/, '').trim();
      }
    } else {
      const matchKo = koJoinRegex.exec(trimmed);
      if (matchKo) {
        gameName = matchKo[1].trim();
        tagLine = matchKo[2].replace(/님이.*$/, '').trim();
      }
    }

    // Fallback if strict language join regex didn't match full line
    if (!gameName || !tagLine) {
      const matchFallback = fallbackRegex.exec(trimmed);
      if (matchFallback) {
        gameName = matchFallback[1].trim();
        tagLine = matchFallback[2]
          .replace(lang === 'ja' ? /が.*$/ : /님이.*$/, '')
          .trim();
      }
    }

    if (gameName && tagLine) {
      const key = `${gameName}#${tagLine}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        results.push({ gameName, tagLine });
      }
    }
  }

  return results;
}
