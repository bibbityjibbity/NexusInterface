import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";

const mapStateToProps = state => {
  return { ...state.common };
};

const mapDispatchToProps = dispatch => ({});
class Loader extends Component {
  state = {
    loading: true
  };

  componentDidMount() {
    setTimeout(() => this.setState({ loading: false }), 5000);
  }

  render() {
    const { loading } = this.state;

    if (loading) {
      return (
        <div id="loader" className="animated fadeIn">
          <div id="orbit-container">
            <div id="orbit">
              <div id="orbit-cirlce" />
            </div>
            <div id="tritium">
              <div id="proton1" />
              <div id="proton2" />
              <div id="proton3" />
            </div>
          </div>
          <div id="version">Nexus Tritium Wallet</div>
        </div>
      );
    }

    return null; // render null when app is ready
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Loader);
