import { request } from './index'
import { buildContactInformationListQuery } from '@/features/contact-information/lib/contactInformationApi'

export function listContactInformation({ keyword = '', page = 1, pageSize = 20 } = {}) {
  const query = buildContactInformationListQuery({ keyword, page, pageSize })
  return request(`/contact-information?${query}`)
}

export function createContactInformation(payload) {
  return request('/contact-information', {
    method: 'POST',
    body: payload,
  })
}
