# Workspace 导入导出页

## 页面定位

导入导出页负责承接 Excel 模板下载、文件上传预览、问题校验、批次应用与 CSV 导出，是连接外部文件与内部月排班数据的工作流页面。

## 源码与依赖

| 类型 | 位置 |
|------|------|
| 页面组件 | `src/features/workspace/pages/ImportExportCenterPage.vue` |
| 共享组件 | `WorkspacePageHeader.vue`、`WorkspaceSurface.vue` |
| 预览接口 | `POST /api/workspace/import-export/preview` |
| 应用接口 | `POST /api/workspace/import-export/{batchId}/apply` |
| 导出接口 | `GET /api/workspace/import-export/export` |
| 模板接口 | `GET /api/workspace/import-export/template` |

## 核心流程

```mermaid
flowchart LR
    TEMPLATE[下载模板] --> FILL[按模板准备 Excel]
    FILL --> UPLOAD[上传文件并附带 year/month]
    UPLOAD --> PREVIEW[服务端返回预览批次与问题列表]
    PREVIEW --> APPLY[按 batchId 应用有效记录]
    PREVIEW --> EXPORT[按当前 month 导出 CSV]
```

## 核心交互

- 空闲态支持点击上传与拖拽上传。
- 预览请求会附带共享 workspace 的 `year/month`。
- 成功态展示记录数、问题列表与应用操作入口。
- 导出直接消费服务端返回的二进制响应，服务端负责 UTF-8 BOM 与 charset 兼容。
- 切换共享月份后，需要重置当前预览状态，避免批次与工作上下文错位。

## 模板结构

| Sheet | 名称 | 说明 |
|------|------|------|
| 0 | `Shift Definitions` | 班次定义，支持单团队或逗号分隔的共享团队 |
| 1 | `Staff Shifts` | 员工日排班 |
| 2 | `Color Definitions` | 班次颜色映射 |

## 数据边界与约束

- 当前页面覆盖预览、应用、导出与模板下载，不提供浏览器内字段级映射修正。
- `batchId` 是预览与应用之间的唯一纽带，不能由前端自行推导。
- 导出结果由服务端定义，前端不应在浏览器侧拼接 CSV 内容。

## 维护提示

- 若未来增加导入问题修复、字段映射编辑或批量回滚，应拆出专门章节。
- 模板格式、上传参数或响应结构变化时，必须同步更新本页与服务端 `import-export` spec。

