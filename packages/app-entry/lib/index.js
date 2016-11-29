import 'react-hot-loader/patch'
import 'babel-polyfill'
import 'normalize.css/normalize.css'
import './reset.pcss'

/* eslint-disable */
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { Provider } from 'react-redux'
import { combineReducers, createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import WebFont from 'webfontloader'

import hx from '@bruitt/hyperscript/dist/react'
/* eslint-enable */

let h = hx({})

export let configureStore = (rootReducer, initialState) => {
  if (process.env.WEBFONTLOADER) {
    WebFont(process.env.WEBFONTLOADER)
  }

  let sagaMiddleware = createSagaMiddleware()

  let createStoreWithMiddleware = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore)

  let getReducers = () => combineReducers(rootReducer)

  let store = createStoreWithMiddleware(getReducers(), initialState)
  store.runSaga = sagaMiddleware.run

  return store
}

export let wrapAppComponent = (store, Component) => {
  return h(AppContainer, [
    h(Provider, { store }, [
      h(Component)
    ])
  ])
}

export let renderAppComponent = (root, store) => (Component) => {
  let wrappedComponent = wrapAppComponent(store, Component)

  render(wrappedComponent, root)
}
