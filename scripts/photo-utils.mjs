/**
 * Normalize supported Creative Commons links; reject unknown paths or domains.
 */
export function normalizeLicense(value) {
  try {
    const url = new URL(String(value));
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      !['creativecommons.org', 'www.creativecommons.org'].includes(
        url.hostname
      ) ||
      url.username ||
      url.password ||
      url.port
    )
      return undefined;
    const match = url.pathname.match(
      /^\/(licenses\/(?:by|by-sa)\/(?:2\.0|2\.5|3\.0|4\.0)|publicdomain\/zero\/1\.0)(?:\/(?:deed(?:\.[a-zA-Z-]+)?|legalcode(?:\.[a-zA-Z-]+)?))?\/?$/
    );
    return match ? `https://creativecommons.org/${match[1]}/` : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Prefer Wikidata images, then alternatives and the free Wikipedia page image.
 * Skip deprecated claims and duplicates; limit lookup to eight candidates.
 */
export function imageCandidates(claims, pageImage) {
  const ranked = claims
    .filter(c => c.rank !== 'deprecated')
    .sort(
      (a, b) => Number(b.rank === 'preferred') - Number(a.rank === 'preferred')
    );
  return [
    ...new Set(
      [...ranked.map(c => c.mainsnak?.datavalue?.value), pageImage].filter(
        f => typeof f === 'string' && f.length > 0
      )
    )
  ].slice(0, 8);
}
