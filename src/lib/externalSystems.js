import messageDeliveryKnowledgeBaseIcon from '@/assets/external-systems/message-delivery-kb.png'

export const EXTERNAL_SYSTEM_LINKS = [
  {
    id: 'xmatters',
    name: 'xMatters',
    description: 'Incident alerting and escalation coordination.',
    url: import.meta.env.VITE_XMATTERS_URL || 'https://www.xmatters.com/',
    iconUrl: 'https://www.xmatters.com/favicon.ico',
  },
  {
    id: 'servicenow',
    name: 'ServiceNow',
    description: 'Service management, tickets, and operational workflows.',
    url: import.meta.env.VITE_SERVICENOW_URL || 'https://www.servicenow.com/',
    iconUrl: 'https://www.servicenow.com/favicon.ico',
  },
  {
    id: 'message-delivery-knowledge-base',
    name: 'Message Delivery Knowledge Base',
    description: 'Internal delivery procedures, support notes, and runbooks.',
    url: import.meta.env.VITE_MESSAGE_DELIVERY_KB_URL || 'https://learn.microsoft.com/',
    iconUrl: messageDeliveryKnowledgeBaseIcon,
  },
]
