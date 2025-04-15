function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function globToRegex(glob) {
  const escaped = glob.split('*').map(escapeRegex).join('.*');
  return new RegExp('^' + escaped + '$');
}

function matchesAnyPattern(str, patterns) {
  return patterns.some((pattern) => {
    const regex = globToRegex(pattern);
    return regex.test(str);
  });
}

export { matchesAnyPattern };
