/**
 * utils/config.js
 * [改动] 全局配置收敛 —— 替代原代码中 100+ 处硬编码的 https://kpy.phanlink.com/v1/...
 *
 * 改动说明：
 *   - 新增文件
 *   - 所有页面统一从此文件引入 API_BASE / CDN_BASE，不再各自硬编码域名
 *   - 环境切换只需改 APP_ENV 一个变量
 *
 * 用法：
 *   const { API_BASE, CDN_BASE } = require('../../utils/config');
 *   // API_BASE = 'https://kpy.phanlink.com/v1'
 *   // CDN_BASE = 'https://imgs.phanlink.com/program'
 */

// ----- 环境标识 -----
// 切换环境时只需修改此处：'development' | 'staging' | 'production'
const APP_ENV = 'production';

// ----- 各环境域名配置 -----
const ENV_MAP = {
  development: {
    API_HOST: 'https://kpy-dev.phanlink.com',
    CDN_HOST: 'https://imgs-dev.phanlink.com',
  },
  staging: {
    API_HOST: 'https://kpy-staging.phanlink.com',
    CDN_HOST: 'https://imgs-staging.phanlink.com',
  },
  production: {
    API_HOST: 'https://kpy.phanlink.com',
    CDN_HOST: 'https://imgs.phanlink.com',
  },
};

const currentEnv = ENV_MAP[APP_ENV] || ENV_MAP.production;

module.exports = {
  /** 当前环境标识 */
  ENV: APP_ENV,

  /** API 基础路径（原代码中 100+ 处硬编码的 https://kpy.phanlink.com/v1） */
  API_BASE: `${currentEnv.API_HOST}/v1`,

  /** API 主机（不含 /v1，用于 generate_qrcode.php 等非 v1 接口） */
  API_HOST: currentEnv.API_HOST,

  /** CDN / 图片基础路径（原代码中硬编码的 https://imgs.phanlink.com/program） */
  CDN_BASE: `${currentEnv.CDN_HOST}/program`,

  /** CDN 主机（不含 /program，用于 https://imgs.phanlink.com/xxx 格式） */
  CDN_HOST: currentEnv.CDN_HOST,

  /** 请求超时（毫秒），微信官方默认 60000，缩短为 15s 提升体验 */
  REQUEST_TIMEOUT: 15000,

  /** 上传超时 */
  UPLOAD_TIMEOUT: 60000,
};
