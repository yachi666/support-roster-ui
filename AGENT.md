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

## Update Workflow

- 修改代码前，先判断本次变更会影响哪些 spec。
- 修改代码后，立即同步更新 `.specs` 中对应文档。
- 新增 spec 文件时，同时更新最近一级的导航文件；一级入口更新到 `.specs/spec.md`，子目录入口更新到对应 `index.md`。
- 提交结果前，确认代码实现、spec 内容、导航入口三者一致。

## Scope Notes

- `figma-design/`、`figma-design-workspace/` 下的设计稿、导入资料或实验性文档可以保留，但前端项目持续维护的正式规范统一收敛到 `.specs/`。
- 若变更较小，也不能跳过 spec 同步；至少要确认并更新受影响的对应文档。
- 如果某项功能已经形成独立模块或页面簇，应优先拆到对应子目录并提供清晰导航，而不是持续堆积到 `spec.md`。