# Workspace 校验中心页

## 页面定位

校验中心页负责汇总当前月份的问题列表、严重级别统计和批量处理入口，用于帮助管理员集中查看并解决排班与导入相关异常。

## 源码与依赖

| 类型 | 位置 |
|------|------|
| 页面组件 | `src/features/workspace/pages/ValidationCenterPage.vue` |
| 共享组件 | `WorkspacePageHeader.vue`、`WorkspaceSurface.vue` |
| 查询接口 | `GET /api/workspace/validation?year=&month=` |
| 处理接口 | `POST /api/workspace/validation/resolve` |

## 核心交互

- 搜索可按类型、描述、团队和日期过滤问题。
- 行选择是本地 UI 状态，但批量操作提交的是真实 issue ID 集合。
- 只有可处理的问题允许进入批量或单条修复动作。
- 顶部统计卡展示服务端返回的严重级别摘要。
- 成功处理后，应使用服务端返回的新列表和新统计覆盖当前页面，而不是乐观更新局部行。

## 数据边界与约束

- Issue ID 以字符串贯穿前后端，避免大整数精度问题。
- 页面年月来源于共享 workspace 月份上下文，与月排班和导入导出保持一致。
- 不可处理的问题需要明确标注为只读或手工处理，避免误导用户。

## 维护提示

- 若未来引入更复杂的过滤器、批量策略或修复工作流，应拆分为独立子章节。
- 问题模型、严重级别统计或 resolve 协议变化时，需要同步更新本页和服务端 `validation` spec。

