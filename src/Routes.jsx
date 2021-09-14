import React, { Component } from "react";

import { Switch, BrowserRouter, Route } from "react-router-dom";

import Home from "./page/Home";
import List from "./page/List";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Switch>
          <Route exact path="/" component={Home}></Route>
          <Route exact path="/list" component={List}></Route>
          <Route component={() => "404"}></Route>
        </Switch>
      </div>
    );
  }
}

export default App;
