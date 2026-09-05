import { WWW_REGEX } from "../../../core/config/constants";
import { TYPED_COUNT_WEIGHT } from "../spotlight.constants";

export interface SuggestionCandidate {
  authority: string;
  authorityLower: string;
  fullPath: string;
  fullPathLower: string;
  typedCount: number;
  visitCount: number;
}

interface ScorableItem {
  url?: string | null;
  typedCount?: number | null;
  visitCount?: number | null;
}

export function parseHistoryEntry(
  item: ScorableItem,
): SuggestionCandidate | null {
  if (!item.url?.startsWith("http")) return null;

  let url: URL;
  try {
    url = new URL(item.url);
  } catch {
    return null;
  }

  // Complete against the authority (host + explicit port) so visited
  // origins like localhost:3000 are suggested as-is; hostname drops ports.
  const authority = url.host.replace(WWW_REGEX, "");
  const fullPath = authority + url.pathname + url.search + url.hash;
  return {
    authority,
    authorityLower: authority.toLowerCase(),
    fullPath,
    fullPathLower: fullPath.toLowerCase(),
    typedCount: item.typedCount || 0,
    visitCount: item.visitCount || 0,
  };
}

export function pickBestSuggestion(
  query: string,
  candidates: SuggestionCandidate[],
): string {
  const lower = query.toLowerCase();
  const hasPath = lower.includes("/");

  let bestScore = -1;
  let bestSuggestion = "";

  for (const entry of candidates) {
    let matched = false;
    let candidate = "";

    if (hasPath) {
      if (entry.fullPathLower.startsWith(lower)) {
        candidate = query + entry.fullPath.slice(query.length);
        matched = true;
      }
    } else if (entry.authorityLower.startsWith(lower)) {
      candidate = query + entry.authority.slice(query.length);
      matched = true;
    }

    if (!matched) continue;
    if (candidate.toLowerCase() === lower) continue;

    const score = entry.typedCount * TYPED_COUNT_WEIGHT + entry.visitCount;
    if (score > bestScore) {
      bestScore = score;
      bestSuggestion = candidate;
    }
  }

  return bestSuggestion;
}
