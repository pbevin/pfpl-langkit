import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import configureStore from "./store/configureStore";
import "normalize.css";
import "./styles/styles.css";

const store = configureStore();

const el = document.getElementById("app");

function render() {
  const App = require("./containers/App").default;
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>, el
  );
}

if (module.hot) {
  module.hot.accept("./containers/App", () => {
    setTimeout(() => {
      try {
        render();
      } catch (error) {
        const RedBox = require("redbox-react");
        ReactDOM.render(<RedBox error={error} />, el);
      }
    });
  });
}

render();
