export function normalizeTeamName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s\-_]+/g, ' ')
    .replace(/[^\w\s]/g, '');
}

export function stripAlphanumeric(name) {
  if (!name || typeof name !== 'string') return '';
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
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

  const stripped1 = stripAlphanumeric(str1);
  const stripped2 = stripAlphanumeric(str2);
  if (stripped1 === stripped2 && stripped1.length > 0) {
    return 0.98;
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
  const strippedCandidate = stripAlphanumeric(candidateName);

  const matches = [];

  for (const team of existingTeams) {
    const teamNorm = team.teamNameNormalized || normalizeTeamName(team.teamName);
    const teamStripped = stripAlphanumeric(team.teamName);

    if (normCandidate === teamNorm || strippedCandidate === teamStripped) {
      matches.push({
        team,
        similarity: 1.0,
        isExact: true,
      });
      continue;
    }

    const similarity = calculateSimilarity(candidateName, team.teamName);
    if (similarity >= 0.75) {
      matches.push({
        team,
        similarity,
        isExact: false,
      });
    }
  }

  return matches.sort((a, b) => b.similarity - a.similarity);
}
