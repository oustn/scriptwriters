export * from './router/index.js';
import { Application } from './application.js'

function createApplication() {
  const app = new Application()
  app.init()
  return app
}

export default createApplication
