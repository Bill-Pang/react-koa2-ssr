import React, { Component } from "react";

import Routes from "./Routes.jsx";
import Nav from "./components/Nav.jsx";

class App extends Component {
  componentDidMount() {
    console.log("哈哈哈~ 服务器渲染成功了！");
  }

  render() {
    return (
      <div className="App">
        <Nav />
        <Routes />
      </div>
    );
  }
}

export default App;
