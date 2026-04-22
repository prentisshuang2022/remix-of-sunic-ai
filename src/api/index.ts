/**
 * API 层入口文件
 *
 * 所有数据请求函数按模块分文件存放在 src/api/ 目录下。
 * 每个函数必须：
 *   1. 有完整 JSDoc 注释（用途、HTTP method、path、入参、返回值、后端职责）
 *   2. 返回 ApiResponse<T> 结构
 *   3. 当前阶段调用 src/mocks/ 下的 Mock 数据，后续替换为真实请求
 *
 * 命名规范：按模块分文件，如 employeeApi.ts、performanceApi.ts
 */

// 后续模块导出示例：
// export * from "./employeeApi";
// export * from "./performanceApi";
// export * from "./recruitingApi";
// export * from "./trainingApi";
// export * from "./attendanceApi";
// export * from "./chatApi";