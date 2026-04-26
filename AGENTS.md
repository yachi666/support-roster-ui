# Support Roster UI Agent Instructions

## Spec Maintenance Rules

- 每次完成代码更新后，必须同步检查并更新对应的 spec 文档，spec 更新是代码变更的一部分，不能遗漏。
- 所有正式技术规范统一维护在 `support-roster-ui/.specs` 目录下，不要将新的规范文档分散到其他目录。
- 如果代码变更涉及页面结构、组件行为、路由、状态管理、接口联调、数据模型、交互流程、视觉规范或实现约束，必须在同一次任务中把对应 spec 同步完成。
- 如果现有 spec 没有合适承载位置，应在 `.specs` 下新增对应文档或子目录，而不是把不同主题混写进单个文件。

## Spec Directory Conventions

- `.specs/spec.md` 是前端 spec 总入口，新增任何一级 spec 文档或主题目录后，必须同步更新该入口导航。
- 当前已存在的 `workspace/index.md` 是局部主题入口；后续新增复杂子主题时，应沿用 `index.md` 作为该目录的局部导航。
- spec 目录结构要保持清晰，按主题拆分，例如：`modules/`、`workspace/`、`architecture`、`ui-design`。
- 单个 spec 文件应尽量聚焦单一主题，避免把页面逻辑、组件实现、接口约束、视觉规范、交互流程混在同一文件中。
- 文件命名保持语义化和可读性，优先使用 kebab-case。
- 涉及本地联调、脚本重启、服务健康检查或浏览器自动化验证时，优先参考 `.specs/development.md`，并在流程变化时同步更新该文档。

## Update Workflow

- 修改代码前，先判断本次变更会影响哪些 spec。
- 修改代码后，立即同步更新 `.specs` 中对应文档。
- 新增 spec 文件时，同时更新最近一级的导航文件；一级入口更新到 `.specs/spec.md`，子目录入口更新到对应 `index.md`。
- 提交结果前，确认代码实现、spec 内容、导航入口三者一致。

## Product Update Log Maintenance

- 创建或准备 PR 时，如果变更包含用户可见功能、页面、交互、权限、数据口径、部署入口或重要修复，必须同步维护 `src/features/product-updates/data/productUpdates.js`。
- 产品更新日志必须同时维护中文 `zh-CN` 与英文 `en` 内容，不允许只更新单一语言。
- 更新日志条目应面向用户表达“变了什么、影响谁、价值是什么”，不要只写技术实现。
- 如果 PR 只是内部重构、测试补充或无用户可见影响，可以不新增产品更新日志，但应在 PR 描述中说明无用户可见更新。
- 产品更新日志界面本身保持独立路由 `/product-updates`，内容默认由 AI 在相关 PR 中维护，不在页面内提供手工“新建日志”入口。

## Scope Notes

- 前端项目持续维护的正式规范统一收敛到 `.specs/`，不要把设计稿、导入资料或实验性文档长期留在项目根目录下分散维护。
- 若变更较小，也不能跳过 spec 同步；至少要确认并更新受影响的对应文档。
- 如果某项功能已经形成独立模块或页面簇，应优先拆到对应子目录并提供清晰导航，而不是持续堆积到 `spec.md`。
- 先和我对其需求再修改 有任何想法向我确认

## Browser Automation

- 涉及前端登录流程、工作台核心页面冒烟、权限路由校验或回归验证时，优先使用仓库根目录的 `@automationtest/`
- 不要在 `support-roster-ui/` 内临时创建一次性浏览器脚本；优先把可复用测试沉淀到 `automationtest/specs`、`pages`、`helpers`、`fixtures`
- 当前默认执行方式：
  - `cd automationtest && npm run precheck`
  - `npm run test:smoke`
- 若新增测试数据自动化，优先扩展 `automationtest/helpers/seed-contracts.mjs` 和 `automationtest/helpers/cleanup-registry.mjs`，保证测试数据具备明确的创建/清理生命周期
