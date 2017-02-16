v.4.x.x

Breaking changes:

* redux-saga is not prebundled dependency anymore, extra middlewares are
  passed to `configureStore` function

```
import createSagaMiddleware from 'redux-saga'

let store = configureStore(rootReducer, {}, [ sagaMiddleware, thunk, ... ])
store.runSaga = sagaMiddleware.run
store.runSaga(rootSaga)
```

* `reset.pcss` is not resetting :root bg-color to white anymore

* ramda is not exposed as global import anymore due to conflict with
  babel-plugin-ramda

New features:

* babel-preset-env

* spa prerendering

* aliasing react -> preact now made possible with sane default workarounds

```
alias:
  "react": "preact-compat"
  "react-dom": "preact-compat"
```

* drop autoprefixer flexbox old 2009 syntax support

* force transpiling selected node_modules packages

* sane defaults

See [boilerplate config](https://github.com/bruitt/boilerplate/blob/master/config/webpack.yml) for more details
