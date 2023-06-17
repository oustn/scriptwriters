import { fetch, logger, call, notify } from "@scriptwriter/quantumult";

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
