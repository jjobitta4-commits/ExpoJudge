export function normalizeTeamName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function levenshteinDistance(a, b) {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, () => new Array(an + 1).fill(0));

  for (let i = 0; i <= an; i++) matrix[0][i] = i;
  for (let j = 0; j <= bn; j++) matrix[j][0] = j;

  for (let j = 1; j <= bn; j++) {
    for (let i = 1; i <= an; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,
        matrix[j][i - 1] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }

  return matrix[bn][an];
}

export function calculateSimilarity(s1, s2) {
  const str1 = normalizeTeamName(s1);
  const str2 = normalizeTeamName(s2);

  if (str1 === str2) return 1.0;
  if (!str1 || !str2) return 0.0;

  if (str1.includes(str2) || str2.includes(str1)) {
    return 0.95;
  }

  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1.0;

  const ratio = (maxLength - distance) / maxLength;
  return Math.round(ratio * 100) / 100;
}

export function findPotentialDuplicates(candidateName, existingTeams) {
  if (!candidateName || !candidateName.trim() || !Array.isArray(existingTeams)) {
    return [];
  }

  const normCandidate = normalizeTeamName(candidateName);
  if (!normCandidate) return [];

  const matches = [];

  for (const item of existingTeams) {
    const team = item.team || item;
    const teamName = team.teamName || team.name || '';
    const normTeam = team.teamNameNormalized || normalizeTeamName(teamName);

    if (normCandidate === normTeam) {
      matches.push({
        team,
        similarity: 1.0,
        isExact: true,
      });
      continue;
    }

    if (normCandidate.includes(normTeam) || normTeam.includes(normCandidate)) {
      matches.push({
        team,
        similarity: 0.95,
        isExact: false,
      });
      continue;
    }

    const similarity = calculateSimilarity(normCandidate, normTeam);
    if (similarity >= 0.85) {
      matches.push({
        team,
        similarity,
        isExact: false,
      });
    }
  }

  return matches.sort((a, b) => b.similarity - a.similarity);
}
