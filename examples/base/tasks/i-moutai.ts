/**
 * @script task
 * @corn 0 12 * * 1
 * @tag 获取茅台积分
 * @icon https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/YouTube_Letter.png
 */

import { fetch, logger, call, notify } from "@scriptwriter/quantumult";

class Map {}

call(async () => {
  logger.info("Hello, world!");
  await fetch("https://www.baidu.com").then(async (data) => {
    logger.info(data.text());

    notify("Hello, world!", "Hello, world!", data.text(), {
      "media-url": "https://www.baidu.com/img/flexible/logo/pc/peak-result.png",
      "open-url": "https://www.baidu.com",
    });
  });
});

export default new Map();
