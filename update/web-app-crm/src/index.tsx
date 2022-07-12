import React from "react";
import ReactDOM from "react-dom/client";
import App from "./containers/App/App";
import { Provider } from "react-redux";
import { setupStore } from "./store/store";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const store = setupStore();

store.subscribe(() => {
  localStorage['redux-store'] = JSON.stringify(store.getState());
});


root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
