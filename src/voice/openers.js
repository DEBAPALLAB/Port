// The first line should sound like someone looking up when a friend walks over:
// short and plain. Variety comes from the model, not from gimmicks.
const OPENERS = [
  'Say hi casually, like you just noticed them.',
  'Say hey, and lightly acknowledge that it is a bit odd being a cartoon of yourself.',
  'Say hi, and mention the time of day only if it feels natural.',
];

function partOfDay(hour) {
  if (hour < 5) return 'late night';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

export function openingPrompt({ date = new Date(), random = Math.random } = {}) {
  const opener = OPENERS[Math.floor(random() * OPENERS.length)];
  return `[A visitor just started a conversation. It is ${partOfDay(date.getHours())} for them. Speak English.] ${opener} `
    + 'Say you are Dev, well, the AI cartoon version of him, then ask if they want to hear about the work or about you. '
    + 'Two short sentences, under six seconds.';
}
