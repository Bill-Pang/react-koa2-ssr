import React, { Component } from "react";
import { Link } from "react-router-dom";

class Nav extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div>
        <p>
          <Link to="/">Home</Link>
        </p>
        <p>
          <Link to="/list">List</Link>
        </p>
      </div>
    );
  }
}

export default Nav;
