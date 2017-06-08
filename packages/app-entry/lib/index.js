import "normalize.css/normalize.css"
import "./reset.pcss"

/* eslint-disable */
import { h, render } from "preact"
import { load as loadWebFonts } from "webfontloader"
/* eslint-enable */

if (process.env.WEBFONTLOADER) {
  loadWebFonts(process.env.WEBFONTLOADER)
}

if (process.env.SENTRY_DSN) {
  window.Raven.config(process.env.SENTRY_DSN).install()
}

let preloader = document.getElementById("preloader")
if (preloader) {
  preloader.remove()
}

let root = null
export let renderAppComponent = (rootApp) => () => {
  root = render(h(rootApp), document.body, root)
}
