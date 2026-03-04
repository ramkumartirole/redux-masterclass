// ════════════════════════════════════════════════════
// REDUX MASTERCLASS — Complete Project Code Reference
// ════════════════════════════════════════════════════
//
// Project Structure:
//
// src/
// ├── app/
// │   └── store.js
// ├── features/
// │   ├── counter/counterSlice.js
// │   ├── todos/todosSlice.js
// │   ├── auth/authSlice.js
// │   └── cart/cartSlice.js
// ├── hooks/
// │   └── typedHooks.js
// └── utils/
//     └── api.js
//
// ════════════════════════════════════════════════════


// ─────────────────────────────────────────────────────
// FILE: src/app/store.js
// ─────────────────────────────────────────────────────
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import todosReducer   from '../features/todos/todosSlice';
import authReducer    from '../features/auth/authSlice';
import cartReducer    from '../features/cart/cartSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    todos:   todosReducer,
    auth:    authReducer,
    cart:    cartReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// TypeScript types (if using TS, rename file to store.ts)
// export type RootState   = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;


// ─────────────────────────────────────────────────────
// FILE: src/features/counter/counterSlice.js
// ─────────────────────────────────────────────────────
import { createSlice, createSelector } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0, step: 1 },
  reducers: {
    increment(state)          { state.value += state.step; },
    decrement(state)          { state.value -= state.step; },
    reset(state)              { state.value = 0; },
    setStep(state, action)    { state.step = action.payload; },
    incrementByAmount(state, action) { state.value += action.payload; },
  }
});

export const { increment, decrement, reset, setStep, incrementByAmount } = counterSlice.actions;
export const selectCount = (state) => state.counter.value;
export const selectStep  = (state) => state.counter.step;
export default counterSlice.reducer;


// ─────────────────────────────────────────────────────
// FILE: src/features/todos/todosSlice.js
// ─────────────────────────────────────────────────────
import { createSlice, createSelector } from '@reduxjs/toolkit';

const todosSlice = createSlice({
  name: 'todos',
  initialState: { items: [], filter: 'all', nextId: 1 },
  reducers: {
    addTodo(state, action) {
      state.items.push({ id: state.nextId++, text: action.payload, completed: false });
    },
    toggleTodo(state, action) {
      const todo = state.items.find(t => t.id === action.payload);
      if (todo) todo.completed = !todo.completed;
    },
    deleteTodo(state, action) {
      state.items = state.items.filter(t => t.id !== action.payload);
    },
    clearCompleted(state) {
      state.items = state.items.filter(t => !t.completed);
    },
    setFilter(state, action) {
      state.filter = action.payload;
    },
    editTodo(state, action) {
      const { id, text } = action.payload;
      const todo = state.items.find(t => t.id === id);
      if (todo) todo.text = text;
    },
  }
});

export const { addTodo, toggleTodo, deleteTodo, clearCompleted, setFilter, editTodo } = todosSlice.actions;

// Memoised selectors
const selectAllTodos  = (state) => state.todos.items;
const selectFilter    = (state) => state.todos.filter;

export const selectVisibleTodos = createSelector(
  [selectAllTodos, selectFilter],
  (todos, filter) => {
    if (filter === 'active')    return todos.filter(t => !t.completed);
    if (filter === 'completed') return todos.filter(t =>  t.completed);
    return todos;
  }
);
export const selectTodoCount = createSelector(selectAllTodos, t => t.length);
export const selectActiveCount = createSelector(selectAllTodos, t => t.filter(x => !x.completed).length);

export default todosSlice.reducer;


// ─────────────────────────────────────────────────────
// FILE: src/features/auth/authSlice.js
// ─────────────────────────────────────────────────────
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isLoggedIn: false, status: 'idle', error: null },
  reducers: {
    logout(state) {
      state.user      = null;
      state.isLoggedIn = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending,   (state) => { state.status = 'loading'; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status     = 'succeeded';
        state.user       = action.payload;
        state.isLoggedIn = true;
      })
      .addCase(loginUser.rejected,  (state, action) => {
        state.status = 'failed';
        state.error  = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectCurrentUser = (state) => state.auth.user;
export default authSlice.reducer;


// ─────────────────────────────────────────────────────
// FILE: src/features/cart/cartSlice.js
// ─────────────────────────────────────────────────────
import { createSlice, createSelector } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: {}, coupon: null },
  reducers: {
    addToCart(state, action) {
      const { id, name, price } = action.payload;
      if (state.items[id]) {
        state.items[id].quantity++;
      } else {
        state.items[id] = { id, name, price, quantity: 1 };
      }
    },
    removeFromCart(state, action) {
      delete state.items[action.payload];
    },
    updateQuantity(state, action) {
      const { id, qty } = action.payload;
      if (qty <= 0) delete state.items[id];
      else state.items[id].quantity = qty;
    },
    applyCoupon(state, action) {
      state.coupon = action.payload;
    },
    removeCoupon(state) {
      state.coupon = null;
    },
    clearCart(state) {
      state.items  = {};
      state.coupon = null;
    },
  }
});

export const { addToCart, removeFromCart, updateQuantity, applyCoupon, removeCoupon, clearCart } = cartSlice.actions;

const COUPONS = { SAVE10: 0.10, SAVE20: 0.20 };

const selectCartItemsMap = (state) => state.cart.items;
const selectCoupon       = (state) => state.cart.coupon;

export const selectCartItems = createSelector(
  selectCartItemsMap, (items) => Object.values(items)
);
export const selectCartItemCount = createSelector(
  selectCartItems, (items) => items.reduce((sum, i) => sum + i.quantity, 0)
);
export const selectCartTotal = createSelector(
  [selectCartItems, selectCoupon],
  (items, coupon) => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const discount = coupon && COUPONS[coupon] ? subtotal * COUPONS[coupon] : 0;
    return { subtotal, discount, total: subtotal - discount, coupon };
  }
);

export default cartSlice.reducer;


// ─────────────────────────────────────────────────────
// FILE: src/hooks/typedHooks.js
// ─────────────────────────────────────────────────────
import { useDispatch, useSelector } from 'react-redux';

// Typed wrappers — use these throughout your app
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Domain hook examples
export function useCart() {
  const dispatch = useAppDispatch();
  const items    = useAppSelector(selectCartItems);
  const count    = useAppSelector(selectCartItemCount);
  const totals   = useAppSelector(selectCartTotal);
  return {
    items, count, totals,
    add:        (product) => dispatch(addToCart(product)),
    remove:     (id)      => dispatch(removeFromCart(id)),
    updateQty:  (id, qty) => dispatch(updateQuantity({ id, qty })),
    applyCoupon:(code)    => dispatch(applyCoupon(code)),
    clear:      ()        => dispatch(clearCart()),
  };
}

export function useTodos() {
  const dispatch = useAppDispatch();
  const todos    = useAppSelector(selectVisibleTodos);
  const filter   = useAppSelector((s) => s.todos.filter);
  return {
    todos, filter,
    add:    (text)    => dispatch(addTodo(text)),
    toggle: (id)      => dispatch(toggleTodo(id)),
    delete: (id)      => dispatch(deleteTodo(id)),
    filter: (f)       => dispatch(setFilter(f)),
    clear:  ()        => dispatch(clearCompleted()),
  };
}


// ─────────────────────────────────────────────────────
// FILE: src/utils/api.js  (axios instance for thunks)
// ─────────────────────────────────────────────────────
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://api.example.com',
  timeout: 10000,
});

// Auto-attach JWT token from Redux store
export const setupInterceptors = (store) => {
  api.interceptors.request.use((config) => {
    const token = store.getState().auth.user?.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        store.dispatch({ type: 'auth/logout' });
      }
      return Promise.reject(err);
    }
  );
};


// ─────────────────────────────────────────────────────
// FILE: src/index.js  (entry point)
// ─────────────────────────────────────────────────────
import React    from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store }    from './app/store';
import { setupInterceptors } from './utils/api';
import App from './App';

setupInterceptors(store);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
