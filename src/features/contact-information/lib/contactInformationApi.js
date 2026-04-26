export function buildContactInformationListQuery({ keyword = '', page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams()
  const normalizedKeyword = String(keyword || '').trim()

  if (normalizedKeyword) {
    params.set('keyword', normalizedKeyword)
  }

  params.set('page', String(page))
  params.set('pageSize', String(pageSize))
  return params.toString()
}
