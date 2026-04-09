export function removePreviewTeams(groups, removedTeamIds) {
  const removedTeamIdSet = new Set((removedTeamIds || []).map((teamId) => String(teamId)))
  const nextGroups = []
  const removedGroups = []

  for (const group of groups || []) {
    if (removedTeamIdSet.has(String(group.teamId))) {
      removedGroups.push(group)
      continue
    }

    nextGroups.push(group)
  }

  return {
    groups: nextGroups,
    removedTeams: removedGroups,
  }
}

export function restorePreviewTeam(removedTeamIds, teamId) {
  return (removedTeamIds || []).filter((item) => String(item) !== String(teamId))
}
