/**
 * @name 获取茅台积分
 * @description 获取茅台的token
 * @script rewrite
 * @host app.moutai519.com.cn
 * @url ^https?:\/\/app\.moutai519\.com\.cn\/xhr\/front\/user\/info
 * @method ^POST
 * @rewrite script-request-header
 */

import { logger, call } from "@scriptwriter/quantumult";

call(async () => {
  logger.info("hello world");
});
