import "normalize.css/normalize.css"
import "./reset.pcss"

/* eslint-disable */
import { h, render } from "preact"
/* eslint-enable */

let preloader = document.getElementById("preloader")
if (preloader) {
  preloader.remove()
}

let root = null
export let renderAppComponent = (rootApp) => () => {
  root = render(h(rootApp), document.body, root)
}
