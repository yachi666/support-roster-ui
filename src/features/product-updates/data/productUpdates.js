// AI-maintained: when creating a PR with user-visible changes, update this log in the same PR.
// Keep both zh-CN and en translations in sync.
export const productUpdateTypes = [
  { value: 'all', label: { 'zh-CN': '全部类型', en: 'All types' } },
  { value: 'feature', label: { 'zh-CN': '新增', en: 'New' } },
  { value: 'improvement', label: { 'zh-CN': '优化', en: 'Improved' } },
  { value: 'fix', label: { 'zh-CN': '修复', en: 'Fixed' } },
  { value: 'permission', label: { 'zh-CN': '权限', en: 'Access' } },
  { value: 'data', label: { 'zh-CN': '数据', en: 'Data' } },
]

export const productUpdateModules = [
  { value: 'all', label: { 'zh-CN': '全部模块', en: 'All modules' } },
  { value: 'viewer', label: { 'zh-CN': '看板', en: 'Viewer' } },
  { value: 'workspace', label: { 'zh-CN': '工作台', en: 'Workspace' } },
  { value: 'roster', label: { 'zh-CN': '排班', en: 'Roster' } },
  { value: 'validation', label: { 'zh-CN': '校验', en: 'Validation' } },
  { value: 'contact', label: { 'zh-CN': '联系信息', en: 'Contact information' } },
  { value: 'linux', label: { 'zh-CN': 'Linux 密码库', en: 'Linux vault' } },
  { value: 'permission', label: { 'zh-CN': '权限', en: 'Access' } },
  { value: 'system', label: { 'zh-CN': '系统', en: 'System' } },
]

export const productUpdates = [
  {
    id: '2026-04-26-contact-information',
    version: '2026.04.26',
    date: '2026-04-26',
    type: 'feature',
    modules: ['contact', 'viewer', 'workspace'],
    prNumbers: [29, 30, 31, 32, 33],
    sectionTypes: ['feature', 'improvement', 'fix'],
  },
  {
    id: '2026-04-24-linux-passwords',
    version: '2026.04.24',
    date: '2026-04-24',
    type: 'feature',
    modules: ['linux', 'permission', 'system'],
    prNumbers: [26, 27, 28],
    sectionTypes: ['feature', 'permission', 'improvement'],
  },
  {
    id: '2026-04-13-teams-contact',
    version: '2026.04.13',
    date: '2026-04-13',
    type: 'feature',
    modules: ['viewer', 'contact'],
    prNumbers: [25],
    sectionTypes: ['feature', 'improvement'],
  },
  {
    id: '2026-04-10-roster-preview',
    version: '2026.04.10',
    date: '2026-04-10',
    type: 'improvement',
    modules: ['workspace', 'roster'],
    prNumbers: [24],
    sectionTypes: ['improvement', 'feature'],
  },
  {
    id: '2026-04-03-search-validation',
    version: '2026.04.03',
    date: '2026-04-03',
    type: 'fix',
    modules: ['workspace', 'roster', 'validation'],
    prNumbers: [22, 23],
    sectionTypes: ['fix', 'improvement'],
  },
  {
    id: '2026-03-27-admin-validation',
    version: '2026.03.27',
    date: '2026-03-27',
    type: 'improvement',
    modules: ['workspace', 'validation', 'roster'],
    prNumbers: [18, 19, 20, 21],
    sectionTypes: ['improvement', 'feature', 'permission'],
  },
  {
    id: '2026-03-26-workspace-entry',
    version: '2026.03.26',
    date: '2026-03-26',
    type: 'permission',
    modules: ['workspace', 'permission', 'system'],
    prNumbers: [9, 15, 16, 17],
    sectionTypes: ['permission', 'improvement', 'fix'],
  },
]

const PRODUCT_UPDATE_TRANSLATIONS = {
  '2026-04-26-contact-information': {
    'zh-CN': {
      title: '联系信息页与导航完善',
      summary: '上线支持团队联系信息入口，接入真实接口，并统一跨页面导航按钮。',
      status: '已发布',
      importance: '重点更新',
      audience: ['值班查看者', '工作台用户', '支持团队管理员'],
      impact:
        '用户可以从看板、工作台和 Linux 密码库快速进入联系信息页，管理员也能维护更灵活的团队联系资料。',
      highlights: [
        '新增公开联系信息页面和创建入口',
        '联系信息列表和创建流程接入真实 API',
        '统一看板、工作台、Linux 密码库和联系信息页的导航按钮',
      ],
      sections: [
        {
          title: '新增功能',
          items: [
            '新增 `/contact-information` 独立页面，用于查看支持团队联系资料。',
            '从 Public Viewer、Workspace 和 Linux 密码库增加联系信息入口。',
            '联系信息列表、分页和创建提交流程改为调用真实后端接口。',
          ],
        },
        {
          title: '体验优化',
          items: [
            '将看板入口文案统一为 roster，并为跨页面导航补齐一致的图标。',
            '压缩 Workspace 顶栏控件，保证导航动作在窄屏下仍尽量可见。',
          ],
        },
        {
          title: '问题修复',
          items: [
            '联系信息创建表单现在只强制要求 Team Name，允许逐步补全其他字段。',
            '空邮箱不再渲染成损坏的邮件链接。',
          ],
        },
      ],
    },
    en: {
      title: 'Contact information page and navigation polish',
      summary:
        'Added a support-team contact directory, connected it to real APIs, and aligned navigation buttons across pages.',
      status: 'Published',
      importance: 'Major update',
      audience: ['Roster viewers', 'Workspace users', 'Support team admins'],
      impact:
        'Users can open contact information from the viewer, workspace, and Linux vault, while admins can maintain team contact records more flexibly.',
      highlights: [
        'Added a public contact information page and create flow',
        'Connected contact list and create flows to real APIs',
        'Aligned navigation buttons across viewer, workspace, Linux vault, and contact pages',
      ],
      sections: [
        {
          title: 'New features',
          items: [
            'Added the standalone `/contact-information` page for support team contact records.',
            'Added contact information navigation from Public Viewer, Workspace, and Linux Password Vault flows.',
            'Moved contact list, pagination, and create submit flows from mocks to real backend APIs.',
          ],
        },
        {
          title: 'Experience improvements',
          items: [
            'Renamed the viewer navigation copy to roster and added consistent icons to cross-page navigation actions.',
            'Compacted Workspace topbar controls so navigation actions remain visible on narrower screens.',
          ],
        },
        {
          title: 'Fixes',
          items: [
            'The contact create form now only requires Team Name, allowing other fields to be completed later.',
            'Empty email fields no longer render broken mail links.',
          ],
        },
      ],
    },
  },
  '2026-04-24-linux-passwords': {
    'zh-CN': {
      title: 'Linux 密码库独立页面',
      summary: '新增受控 Linux 密码库页面，并加强登录后安全跳转和 UI 体验。',
      status: '已发布',
      importance: '重点更新',
      audience: ['系统管理员', '具备访问权限的工作台用户'],
      impact: '受权用户可以集中查看 Linux 主机凭据，登录跳转也只允许进入已知安全页面。',
      highlights: [
        '新增 Linux 密码库页面和受控路由',
        '登录后仅保留已知安全应用跳转',
        '密码库页面补齐国际化、favicon 和测试覆盖',
      ],
      sections: [
        {
          title: '新增功能',
          items: [
            '新增 Linux 密码库页面、入口和页面规格。',
            'Linux 密码库支持目录分组、列表查看和页面级交互状态。',
            'Public Viewer 员工卡片中的 Teams 动作改为指定 PNG 图标展示。',
          ],
        },
        {
          title: '权限调整',
          items: [
            '将 `linux-passwords` 纳入工作台访问策略配置。',
            '登录跳转只允许 `/viewer`、`/workspace`、`/linux-passwords` 等已知安全应用路由。',
            '阻止无效或路径穿越形式的 redirect 参数。',
          ],
        },
        {
          title: '体验优化',
          items: [
            '优化 Linux 密码库页面布局、数据流和本地化内容。',
            '新增 Linux 密码库 hook 和页面行为测试。',
          ],
        },
      ],
    },
    en: {
      title: 'Standalone Linux Password Vault',
      summary:
        'Added a protected Linux Password Vault page with safer post-login redirects and refined UI behavior.',
      status: 'Published',
      importance: 'Major update',
      audience: ['System admins', 'Workspace users with access'],
      impact:
        'Authorized users can browse Linux host credentials in one place, and post-login redirects now stay within known safe app routes.',
      highlights: [
        'Added the Linux Password Vault page and protected route',
        'Preserved only known safe app redirects after sign-in',
        'Added i18n, favicon coverage, and tests for the vault experience',
      ],
      sections: [
        {
          title: 'New features',
          items: [
            'Added the Linux Password Vault page, entry points, and frontend specs.',
            'The vault supports directory grouping, list browsing, and page-level interaction state.',
            'Replaced the Teams action in the Public Viewer employee card with the provided PNG icon.',
          ],
        },
        {
          title: 'Access changes',
          items: [
            'Added `linux-passwords` to workspace access policy definitions.',
            'Post-login redirects are limited to known safe app routes such as `/viewer`, `/workspace`, and `/linux-passwords`.',
            'Invalid and traversal-style redirect targets are blocked.',
          ],
        },
        {
          title: 'Experience improvements',
          items: [
            'Refined Linux Password Vault layout, data flow, and localization content.',
            'Added tests for Linux password hooks and page behavior.',
          ],
        },
      ],
    },
  },
  '2026-04-13-teams-contact': {
    'zh-CN': {
      title: '看板员工卡片支持 Teams 联系',
      summary: 'Public Viewer 员工悬浮卡片新增 Microsoft Teams 联系动作。',
      status: '已发布',
      importance: '常规更新',
      audience: ['排班查看者', '值班协作人员'],
      impact: '查看排班时可以直接从员工卡片发起 Teams 联系，减少查找联系方式的步骤。',
      highlights: [
        '员工悬浮卡片新增 Teams 联系动作',
        '空联系信息行会自动隐藏',
        'Teams 链接生成逻辑增加测试覆盖',
      ],
      sections: [
        {
          title: '新增功能',
          items: ['使用员工公司邮箱生成 Microsoft Teams 联系链接。'],
        },
        {
          title: '体验优化',
          items: [
            '员工卡片不再显示空联系信息行。',
            '新增看板相关文案的中英文翻译。',
            '补充 viewer timeline 规格说明。',
          ],
        },
      ],
    },
    en: {
      title: 'Teams contact action in viewer cards',
      summary: 'Added a Microsoft Teams contact action to Public Viewer employee hover cards.',
      status: 'Published',
      importance: 'Standard update',
      audience: ['Roster viewers', 'On-call collaborators'],
      impact:
        'Users can start a Teams contact flow directly from an employee card while reviewing the roster.',
      highlights: [
        'Added a Teams contact action to employee hover cards',
        'Empty contact rows are hidden automatically',
        'Added test coverage for Teams URL generation',
      ],
      sections: [
        {
          title: 'New features',
          items: ['Generate Microsoft Teams contact links from employee company email addresses.'],
        },
        {
          title: 'Experience improvements',
          items: [
            'Employee cards no longer show empty contact rows.',
            'Added English and Chinese translations for new viewer labels.',
            'Documented the viewer timeline behavior in the frontend specs.',
          ],
        },
      ],
    },
  },
  '2026-04-10-roster-preview': {
    'zh-CN': {
      title: '排班搜索与导入预览编辑优化',
      summary: '工作台搜索、导入预览和上月排班复制流程更加连贯。',
      status: '已发布',
      importance: '重点更新',
      audience: ['排班管理员', '团队编辑者'],
      impact: '管理员可以更快定位员工、编辑导入预览，并在复制上月排班时遵守可编辑团队范围。',
      highlights: [
        'Workspace 顶栏搜索复用于多个页面',
        '导入预览支持团队移除和恢复',
        '新增上月排班复制辅助逻辑',
      ],
      sections: [
        {
          title: '体验优化',
          items: [
            '总览、团队映射和导入预览流程复用 Workspace 顶栏搜索。',
            '月排班搜索聚焦员工姓名匹配，并按展示名排序。',
            '排班网格 tooltip 改为懒挂载，降低无效渲染。',
          ],
        },
        {
          title: '新增功能',
          items: [
            '导入预览支持移除和恢复团队。',
            '新增上月排班复制 helper，并让复制范围受可编辑团队限制。',
          ],
        },
      ],
    },
    en: {
      title: 'Roster search and import preview editing',
      summary:
        'Workspace search, import preview editing, and previous-month copy flows are now more coherent.',
      status: 'Published',
      importance: 'Major update',
      audience: ['Roster admins', 'Team editors'],
      impact:
        'Admins can find staff faster, edit import previews, and copy previous-month rosters within their editable team scope.',
      highlights: [
        'Reused Workspace topbar search across more pages',
        'Import preview supports team removal and restore',
        'Added helper logic for previous-month roster copy',
      ],
      sections: [
        {
          title: 'Experience improvements',
          items: [
            'Overview, team mapping, and import preview flows now reuse Workspace topbar search.',
            'Monthly roster search focuses on employee-name substring matching and sorts staff by display name.',
            'Roster grid tooltips are lazy mounted to reduce unnecessary rendering.',
          ],
        },
        {
          title: 'New features',
          items: [
            'Import preview now supports removing and restoring teams.',
            'Added previous-month roster copy helpers and scoped copy behavior to editable teams.',
          ],
        },
      ],
    },
  },
  '2026-04-03-search-validation': {
    'zh-CN': {
      title: '工作台搜索与校验选择修复',
      summary: '恢复当前页搜索、月排班员工搜索和校验中心批量处理能力。',
      status: '已发布',
      importance: '常规更新',
      audience: ['排班管理员', '校验处理人员'],
      impact: '搜索和校验批量操作恢复稳定，少量问题队列也能继续多选处理。',
      highlights: [
        'Workspace 顶栏搜索重新与页面本地搜索联动',
        '校验中心小队列恢复多选和批量动作',
        '少量校验问题仍保持详情可见',
      ],
      sections: [
        {
          title: '问题修复',
          items: [
            '修复 Workspace 顶栏搜索与页面本地搜索断开的情况。',
            '修复校验中心在小问题队列下无法多选和批量处理的问题。',
            '修复月排班搜索结果不稳定的问题。',
          ],
        },
        {
          title: '体验优化',
          items: [
            '校验中心在 1-3 条问题时保持紧凑形态，同时保留可读的问题详情。',
            '月排班员工列表按展示名排序。',
          ],
        },
      ],
    },
    en: {
      title: 'Workspace search and validation selection fixes',
      summary:
        'Restored current-page search, monthly roster staff search, and validation bulk actions.',
      status: 'Published',
      importance: 'Standard update',
      audience: ['Roster admins', 'Validation operators'],
      impact: 'Search and validation bulk handling are stable again, including small issue queues.',
      highlights: [
        'Workspace topbar search is wired back to page-local search',
        'Validation Center multi-select and bulk actions work again for small queues',
        'Small validation queues keep issue details visible',
      ],
      sections: [
        {
          title: 'Fixes',
          items: [
            'Fixed Workspace topbar search becoming disconnected from page-local search.',
            'Restored Validation Center multi-select and bulk actions for compact issue queues.',
            'Fixed unstable monthly roster search results.',
          ],
        },
        {
          title: 'Experience improvements',
          items: [
            'Validation Center keeps compact layout for 1-3 issues while retaining readable details.',
            'Monthly roster staff lists are sorted by display name.',
          ],
        },
      ],
    },
  },
  '2026-03-27-admin-validation': {
    'zh-CN': {
      title: '工作台管理流程与校验清理预览',
      summary: '优化工作台管理页、班次定义和校验中心清理流程。',
      status: '已发布',
      importance: '重点更新',
      audience: ['管理员', '团队编辑者', '校验处理人员'],
      impact: '管理流程更清晰，历史无效记录清理前可以先预览，班次编辑也更能解释影响范围。',
      highlights: [
        '校验中心新增清理预览和应用流程',
        '班次定义页补充只读详情和跨团队影响提示',
        '隐藏团队仍可在员工编辑中选择',
      ],
      sections: [
        {
          title: '体验优化',
          items: [
            '优化工作台管理页流程和国际化接线。',
            '班次定义页改进跨夜时间线预览、行操作标签和未保存修改提示。',
            '集中颜色 helper，统一排班和时间线中的颜色处理。',
          ],
        },
        {
          title: '新增功能',
          items: [
            '校验中心接入 remediation preview/apply API。',
            '删除历史无效记录前显示清理预览和确认。',
            '校验中心可以展示系统清理类问题。',
          ],
        },
        {
          title: '权限调整',
          items: [
            '不可编辑团队范围外的用户可以查看只读班次定义详情。',
            '员工编辑中保留隐藏团队的可选择能力，避免已有关系丢失。',
          ],
        },
      ],
    },
    en: {
      title: 'Workspace admin flow and validation cleanup preview',
      summary: 'Refined admin pages, shift definitions, and Validation Center cleanup flows.',
      status: 'Published',
      importance: 'Major update',
      audience: ['Admins', 'Team editors', 'Validation operators'],
      impact:
        'Admin flows are clearer, invalid historical records can be previewed before cleanup, and shift editing better explains its scope.',
      highlights: [
        'Validation Center adds cleanup preview and apply flow',
        'Shift Definitions adds readonly details and cross-team impact hints',
        'Hidden teams remain selectable during staff editing',
      ],
      sections: [
        {
          title: 'Experience improvements',
          items: [
            'Refined workspace admin page flows and i18n wiring.',
            'Improved overnight timeline previews, row action labels, and unsaved-change messaging on Shift Definitions.',
            'Centralized color helpers for consistent roster and timeline colors.',
          ],
        },
        {
          title: 'New features',
          items: [
            'Connected Validation Center remediation preview/apply APIs.',
            'Show cleanup preview and confirmation before deleting historical invalid records.',
            'Surface system cleanup issues inside the Validation Center flow.',
          ],
        },
        {
          title: 'Access changes',
          items: [
            'Users outside the editable team scope can view readonly shift-definition details.',
            'Hidden teams remain selectable in staff editing to avoid losing existing relationships.',
          ],
        },
      ],
    },
  },
  '2026-03-26-workspace-entry': {
    'zh-CN': {
      title: '工作台入口与总览体验优化',
      summary: '工作台入口按权限落到可访问页面，并优化总览、员工编辑和侧边栏可访问性。',
      status: '已发布',
      importance: '重点更新',
      audience: ['所有工作台用户', '管理员'],
      impact:
        '用户进入工作台时会落到自己可访问的页面，总览信息更简洁，员工编辑也更贴合后端自动补全规则。',
      highlights: [
        '工作台入口按当前访问策略选择默认页面',
        '总览页去重并优化视觉呈现',
        '员工编辑允许空姓名以配合后端自动补全',
      ],
      sections: [
        {
          title: '权限调整',
          items: [
            '将 `/workspace` 中立入口与总览页解耦。',
            '工作台入口和登录兜底会跳转到当前账号可访问的第一个页面。',
            '访问策略 fallback 使用默认页面可见性，而不是锁住整个工作台。',
          ],
        },
        {
          title: '体验优化',
          items: [
            '优化 Workspace 总览页，移除重复信息并提升视觉层级。',
            '改进 Workspace 侧边栏可访问性。',
            'Validation Center 轻量化为 issue inbox，并在少量问题时隐藏复杂筛选和批量动作。',
          ],
        },
        {
          title: '问题修复',
          items: [
            '员工编辑不再要求姓名必填，前端校验与后端自动补全行为保持一致。',
            '首次激活密码长度要求从 8 位放宽为 4 位。',
          ],
        },
      ],
    },
    en: {
      title: 'Workspace entry and overview experience updates',
      summary:
        'Workspace entry now lands on an accessible page, with refined overview, staff editing, and sidebar accessibility.',
      status: 'Published',
      importance: 'Major update',
      audience: ['All workspace users', 'Admins'],
      impact:
        'Users enter the first workspace page they can access, overview information is less repetitive, and staff editing aligns with backend autofill behavior.',
      highlights: [
        'Workspace entry selects the default page from the current access policy',
        'Overview page removes duplicate information and improves visual hierarchy',
        'Staff editing allows empty names to match backend autofill behavior',
      ],
      sections: [
        {
          title: 'Access changes',
          items: [
            'Decoupled the neutral `/workspace` entry route from the Overview page.',
            'Workspace entry and auth fallbacks route to the first page allowed by the current account.',
            'Access-policy fallback now follows default per-page visibility instead of locking the whole workspace.',
          ],
        },
        {
          title: 'Experience improvements',
          items: [
            'Optimized Workspace Overview by removing duplicate information and improving visual hierarchy.',
            'Improved Workspace Sidebar accessibility.',
            'Simplified Validation Center into an issue inbox and hides complex filters/bulk actions for small issue counts.',
          ],
        },
        {
          title: 'Fixes',
          items: [
            'Staff editing no longer requires a name, matching backend autofill behavior.',
            'First-time activation password length was relaxed from 8 characters to 4 characters.',
          ],
        },
      ],
    },
  },
}

function resolveProductUpdatesLocale(locale) {
  return locale === 'en' ? 'en' : 'zh-CN'
}

function pickLocalizedValue(value, locale) {
  if (!value || typeof value !== 'object') {
    return value
  }

  const resolvedLocale = resolveProductUpdatesLocale(locale)
  return value[resolvedLocale] || value['zh-CN'] || value.en
}

export function getProductUpdateTypeLabel(type, locale = 'zh-CN') {
  const item = productUpdateTypes.find((entry) => entry.value === type)
  return pickLocalizedValue(item?.label, locale) || type
}

export function getProductUpdateModuleLabel(module, locale = 'zh-CN') {
  const item = productUpdateModules.find((entry) => entry.value === module)
  return pickLocalizedValue(item?.label, locale) || module
}

export function formatProductUpdateModuleList(modules, locale = 'zh-CN') {
  const separator = resolveProductUpdatesLocale(locale) === 'en' ? ', ' : '、'
  return modules.map((module) => getProductUpdateModuleLabel(module, locale)).join(separator)
}

export function formatProductUpdateDate(date, locale = 'zh-CN') {
  return new Intl.DateTimeFormat(resolveProductUpdatesLocale(locale), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

export function getProductUpdateMonth(date, locale = 'zh-CN') {
  return new Intl.DateTimeFormat(resolveProductUpdatesLocale(locale), {
    year: 'numeric',
    month: 'long',
  }).format(new Date(`${date}T00:00:00`))
}

export function localizeProductUpdates(updates, locale = 'zh-CN') {
  const resolvedLocale = resolveProductUpdatesLocale(locale)

  return updates.map((update) => {
    const translation =
      PRODUCT_UPDATE_TRANSLATIONS[update.id]?.[resolvedLocale] ||
      PRODUCT_UPDATE_TRANSLATIONS[update.id]?.['zh-CN']

    if (!translation) {
      return update
    }

    return {
      ...update,
      ...translation,
      sections: update.sectionTypes.map((type, index) => ({
        type,
        ...translation.sections[index],
      })),
    }
  })
}

export function groupProductUpdatesByMonth(updates, locale = 'zh-CN') {
  return updates.reduce((groups, update) => {
    const month = getProductUpdateMonth(update.date, locale)
    const existingGroup = groups.find((group) => group.month === month)

    if (existingGroup) {
      existingGroup.items.push(update)
      return groups
    }

    groups.push({ month, items: [update] })
    return groups
  }, [])
}
