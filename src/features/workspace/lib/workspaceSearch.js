export function normalizeWorkspaceSearchValue(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

export function matchesWorkspaceSearch(values, query) {
  const normalizedQuery = normalizeWorkspaceSearchValue(query)
  if (!normalizedQuery) {
    return true
  }

  return values.some((value) => normalizeWorkspaceSearchValue(value).includes(normalizedQuery))
}

export function filterOverviewContent(content, query) {
  return {
    stats: (content?.stats || []).filter((item) =>
      matchesWorkspaceSearch([item.label, item.value, item.trend], query),
    ),
    quickActions: (content?.quickActions || []).filter((item) =>
      matchesWorkspaceSearch([item.title, item.subtitle, item.actionKey], query),
    ),
    activity: (content?.activity || []).filter((item) =>
      matchesWorkspaceSearch([item.user, item.action, item.time], query),
    ),
  }
}

export function filterTeamsByQuery(teams, query) {
  return (teams || []).filter((team) =>
    matchesWorkspaceSearch([team.name, team.description, team.visible ? 'visible' : 'hidden'], query),
  )
}
