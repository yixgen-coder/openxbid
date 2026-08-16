/**
 * config/index.js
 * [改动] 拆分原 20,437 行单文件 → 瘦身至 ~20 行
 *
 * 改动说明：
 *   - 原 config/index.js 包含 config 对象 + cdnBase + areaData（20,437 行行政区划数据）
 *   - areaData 已拆分到 config/area.js（20,429 行）
 *   - 本文件保留 config 和 cdnBase，并 re-export areaData 保持向后兼容
 *   - 主包体积大幅减少，require 速度提升
 *
 * 注意：本文件使用 ES module 语法（export const），与 TDesign 模板一致
 */

export const config = {
  /** 是否使用mock代替api返回 */
  useMock: true,
};

export const cdnBase =
  'https://imgs.phanlink.com/program/';

// [改动] areaData 从独立文件引入，避免单文件过大
export { areaData } from './area';
