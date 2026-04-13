function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim() : ''
}

export function buildMicrosoftTeamsChatUrl(email) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) {
    return ''
  }

  return `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(normalizedEmail)}`
}
