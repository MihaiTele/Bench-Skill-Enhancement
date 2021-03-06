import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { BrowserRouter as Router } from "react-router-dom";
import { Productprovider } from "./context";

ReactDOM.render(
  <Productprovider>
    <Router>
      <App />
    </Router>
  </Productprovider>,
  document.getElementById("root")
);

serviceWorker.unregister();
