# Redux Masterclass — Basic to Advanced

A complete, structured guide to learning Redux with interactive demos and production-ready code.

## 📂 Project Structure

```
redux-masterclass/
├── redux-masterclass.html          ← Open this! Interactive learning app
├── src/
│   ├── complete-project-code.js    ← All code in one reference file
│   ├── app/
│   │   └── store.js               ← configureStore (RTK)
│   ├── features/
│   │   ├── counter/counterSlice.js
│   │   ├── todos/todosSlice.js
│   │   ├── auth/authSlice.js
│   │   └── cart/cartSlice.js
│   ├── hooks/typedHooks.js
│   └── utils/api.js
└── package.json
```

## 🗺️ Learning Path

| # | Topic | Key Concepts |
|---|-------|-------------|
| 0 | What is Redux? | Mental model, data flow |
| 1 | Core Concepts | Actions, Reducers, Store API |
| 2 | Counter Demo | First store, dispatch, subscribe |
| 3 | combineReducers | Multiple slices, state shape |
| 4 | Todo App | CRUD, array patterns, selectors |
| 5 | Middleware | Logger, auth guard, applyMiddleware |
| 6 | Async / Thunk | Async thunks, loading states |
| 7 | Redux Toolkit | createSlice, createAsyncThunk, RTK |
| 8 | Shopping Cart | Advanced: createSelector, entity adapter |
| 9 | Best Practices | Project structure, patterns to follow/avoid |

## 🚀 Quick Start (React app)

```bash
npx create-react-app my-app
cd my-app
npm install @reduxjs/toolkit react-redux
```

## 📦 Key Packages

- `@reduxjs/toolkit` — The modern Redux library (use this!)
- `react-redux` — React bindings (useSelector, useDispatch, Provider)
- `redux-logger` — Middleware for dev logging
- `axios` — HTTP client for API thunks

## ⚡ Redux in 30 Seconds

```js
// 1. Create a slice
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value++; },
  }
});

// 2. Create the store
const store = configureStore({ reducer: { counter: counterSlice.reducer } });

// 3. In React:
const count = useSelector((s) => s.counter.value);
const dispatch = useDispatch();
dispatch(counterSlice.actions.increment());
```
