export function resolvePreviewTeamKey(group, index = 0) {
  if (group?.previewTeamKey) {
    return String(group.previewTeamKey)
  }

  if (group?.teamId !== null && group?.teamId !== undefined && group?.teamId !== '') {
    return `team:${String(group.teamId)}`
  }

  const teamName = String(group?.team || group?.teamName || 'unassigned').trim() || 'unassigned'
  return `preview:${teamName}:${index}`
}

export function removePreviewTeams(groups, removedTeamIds) {
  const removedTeamIdSet = new Set((removedTeamIds || []).map((teamId) => String(teamId)))
  const nextGroups = []
  const removedGroups = []

  ;(groups || []).forEach((group, index) => {
    if (removedTeamIdSet.has(resolvePreviewTeamKey(group, index))) {
      removedGroups.push(group)
      return
    }

    nextGroups.push(group)
  })

  return {
    groups: nextGroups,
    removedTeams: removedGroups,
  }
}

export function restorePreviewTeam(removedTeamIds, teamId) {
  return (removedTeamIds || []).filter((item) => String(item) !== String(teamId))
}
