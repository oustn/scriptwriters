import { fetch, logger } from "@scriptwriter/quantumult";

try {
  fetch("https://www.baidu.com/")
    .then((res) => res.text())
    .then(logger.log)
    .finally($done);
} catch (e) {
  console.log(e.message);
  $done();
}

declare let $done: (returnValue?: unknown) => void;
