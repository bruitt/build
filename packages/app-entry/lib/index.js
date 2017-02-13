import "react-hot-loader/patch"
import "babel-polyfill"
import "normalize.css/normalize.css"
import "./reset.pcss"

/* eslint-disable */
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { Provider } from 'react-redux'
import { combineReducers, createStore, applyMiddleware, compose } from 'redux'
import { load as loadWebFonts } from 'webfontloader'

import hx from '@bruitt/hyperscript/dist/react'
/* eslint-enable */

let h = hx({})

export let configureStore = (rootReducer, initialState, middlewares = [], enhancers = []) => {
  if (process.env.WEBFONTLOADER) {
    loadWebFonts(process.env.WEBFONTLOADER)
  }

  let createStoreWithMiddleware = compose(
    applyMiddleware(...middlewares),
    ...enhancers,
  )(createStore)

  let getReducers = () => combineReducers(rootReducer)

  let store = createStoreWithMiddleware(getReducers(), initialState)

  return store
}

export let wrapAppComponent = (store, Component) => {
  return h(AppContainer, [
    h(Provider, { store }, [
      h(Component),
    ]),
  ])
}

export let renderAppComponent = (root, store) => (Component) => {
  let wrappedComponent = wrapAppComponent(store, Component)

  render(wrappedComponent, root)
}
