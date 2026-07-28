import type { ParsedRiotId } from '@/types/balancer';
import type { Language } from '@/types/i18n';

/**
 * Parses raw text based on language (ko/ja) and general Riot ID rules.
 * Supports Unicode in both Game Name & Tag Line (Korean, Japanese Kanji/Kana, Chinese, English, Spaces).
 */
export function parseLobbyLog(text: string, lang: Language = 'ko'): ParsedRiotId[] {
  const lines = text.split('\n');
  const results: ParsedRiotId[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let gameName: string | null = null;
    let tagLine: string | null = null;

    // 1. Check if line contains `#` separator (Riot ID: Name#Tag)
    const hashIndex = trimmed.indexOf('#');

    if (hashIndex > 0) {
      gameName = trimmed.substring(0, hashIndex).trim();
      const rest = trimmed.substring(hashIndex + 1).trim();

      // Extract tagLine by stopping at chat suffixes (님이, が, :, whitespace)
      // Supports Unicode characters (e.g. #助けて, #巧克力, #卡特剑圣, #0606, #KR1)
      const tagMatch = /^([^\s:\n.,!?#]+?)(?:님이.*|가.*|が.*|:.*|\s+.*)?$/i.exec(rest);
      if (tagMatch) {
        tagLine = tagMatch[1].replace(/(?:님이|가|が|:).*$/, '').trim();
      } else {
        tagLine = rest.split(/\s+|:|\b님/)[0].trim();
      }
    } else {
      // 2. If no `#Tag` found, check for join message without tag (e.g. "No smite님이 들어왔습니다.")
      const koNoTag = /^(.+?)(?:님이\s*(?:들어왔습니다|로비에\s*참가했습니다|방에\s*입장하셨습니다|\.?))$/i.exec(trimmed);
      const jaNoTag = /^(.+?)(?:が\s*(?:参加しました|ロビーに参加しました|入室しました|\.?))$/i.exec(trimmed);

      if (lang === 'ja' && jaNoTag) {
        gameName = jaNoTag[1].trim();
        tagLine = '';
      } else if (koNoTag) {
        gameName = koNoTag[1].trim();
        tagLine = '';
      } else if (!trimmed.includes('님') && !trimmed.includes('が') && !trimmed.includes(':')) {
        // Plain line without tag or chat indicators
        gameName = trimmed;
        tagLine = '';
      }
    }

    if (gameName) {
      // Clean up any remaining leading/trailing punctuation or chat artifacts
      gameName = gameName.replace(/^["'[(]|["')]$/g, '').trim();
      if (tagLine) {
        tagLine = tagLine.replace(/^["'[(]|["')]$/g, '').trim();
      }

      if (gameName.length > 0) {
        const key = `${gameName}#${tagLine || ''}`.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          results.push({ gameName, tagLine: tagLine || '' });
        }
      }
    }
  }

  return results;
}
