# Spec Change Log

## 2026-03-05

### Summary

本次变更针对 QA 审计发现的关键不一致问题，修复了 `.specs` 文档中的技术事实偏差与可迭代性风险，确保 Spec 与当前代码实现一致。

### Files Changed

- `.specs/spec.md`
- `.specs/modules/timeline.md`
- `.specs/CHANGELOG.md` (new)

### Detailed Changes

| File | Section | Change Type | Before | After | Why |
|---|---|---|---|---|---|
| `.specs/spec.md` | `班次代码 (Shift Codes)` | Fix | `C` 被标记为主班次 (`✓`) | `C` 更正为非主班次 (`✗`) | 与后端 `PRIMARY_CODES = {OC, DS, NS, A, B, D}` 对齐，避免错误实现筛选规则 |
| `.specs/spec.md` | `权限层级 (L1/L2/L3)` | Refine | 仅有角色职责说明，易被误解为已有权限控制 | 重命名为 `角色职责 (非鉴权权限模型)`，新增当前约束：无登录/RBAC、无前端角色态、后端仅按日期/teamId/主班次筛选 | 补齐“职责语义 != 访问控制”边界，提升文档可执行性 |
| `.specs/spec.md` | `相关文档` | Add | 无变更历史入口 | 新增 `变更记录` 链接指向 `./CHANGELOG.md` | 提升文档维护与审计追踪能力 |
| `.specs/modules/timeline.md` | `模块概述` | Fix | 声称已支持“时间轴缩放、班次冲突检测” | 修正为“当前实现支持并行显示、当前时间指示、重叠泳道布局” | 去除超出代码现状的表述 |
| `.specs/modules/timeline.md` | `实现状态` | Add | 未区分已实现与规划能力 | 新增 `Implemented vs Planned`：明确未实现缩放/拖拽/冲突告警 | 降低后续 Agent 对现有能力的误判 |
| `.specs/modules/timeline.md` | `班次布局算法` | Clarify | “冲突检测”措辞可能被理解为业务告警 | 明确算法仅用于布局避让，不产生业务冲突告警 | 与代码语义一致，避免需求误读 |

### Impact Assessment

- **Correctness**: 修复了主班次定义错误，防止后续功能按错误规则开发。
- **Maintainability**: 增加变更入口和状态分层，后续维护更可追踪。
- **Agent Usability**: 明确实现边界，其他 Agent 可基于 Spec 更可靠地做增量开发。

### Verification Notes

已对照以下实现事实进行修正:

- 后端主班次集合: `support-roster-server/src/main/java/com/support/server/supportrosterserver/service/RosterService.java`
- Timeline 固定宽度与布局算法: `support-roster-ui/src/components/Timeline.vue`
- 当前无 RBAC/登录流程: `support-roster-ui/src/api/index.js`, `support-roster-ui/src/components/Dashboard.vue`, `support-roster-server/src/main/java/com/support/server/supportrosterserver/controller/ShiftController.java`

### Backward Compatibility

本次仅修改文档，不涉及运行时代码与接口行为变更。
