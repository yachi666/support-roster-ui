# Public Viewer Modules Index

## 范围

本目录覆盖只读排班看板相关模块，不包含 admin workspace。

适用代码范围：

- `src/pages/PublicDashboardPage.vue`
- `src/components/Dashboard.vue`
- `src/components/Header.vue`
- `src/components/Timeline.vue`
- `src/api/index.js`

## 模块结构

- [Dashboard](./dashboard.md)
- [Header](./header.md)
- [Timeline](./timeline.md)

## 模块关系

```
PublicDashboardPage
    │
    ▼
Dashboard
├── Header
└── Timeline
```

## 维护规则

- Viewer 页面入口变化时，先更新本文件模块关系
- 组件接口或数据流变化时，更新对应模块文档
- 若新增 viewer 级组件并形成独立职责，直接在本目录新增文档并同步补充索引