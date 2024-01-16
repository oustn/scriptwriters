/**
 * 获取茅台积分
 * @description 获取茅台的token
 * @script rewrite
 * @host app.moutai519.com.cn
 * @url ^https?:\/\/app\.moutai519\.com\.cn\/xhr\/front\/user\/info
 * @method ^POST
 * @rewrite script-request-header
 * @comment
 * @comment 这是自定义注释
 * @comment ❤️ ❤️
 */

/**
 * @script rewrite
 * @host app.moutai.com
 * @url ^https:\/\/api\.revenuecat\.com\/.+\/subscribers\/[^/]+/(offerings|attributes)$
 * @method ^POST
 * @rewrite request-header
 * @value (\r\n)X-RevenueCat-ETag:.+(\r\n) request-header $1X-RevenueCat-ETag:$2
 */

import { logger, call } from "@scriptwriter/quantumult";

call(async () => {
  logger.info("hello world");
});
