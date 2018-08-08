import React, { Component } from "react";
import styles from "./style.css";
import DAT from "../../script/globe";
import * as RPC from "../../script/rpc";
import maxmind from "maxmind";
import Request from "request";

export default class NetworkGlobe extends Component {
  componentDidMount() {
    const globeseries = [["peers", []]];
    const geoiplookup = maxmind.openSync(
      "app/GeoLite2-City_20180403/GeoLite2-City.mmdb"
    );
    let myIP = "";
    Request(
      {
        url: "http://www.geoplugin.net/json.gp",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          
          console.log(body);
          RPC.PROMISE("getpeerinfo", []).then(payload => {
            var tmp = {};
            var ip = {};
            for (var i = 0; i < payload.length; i++) {
              ip = payload[i].addr;
              ip = ip.split(":")[0];
              var tmp = geoiplookup.get(ip);
              globeseries[0][1].push(tmp.location.latitude);
              globeseries[0][1].push(tmp.location.longitude);
              globeseries[0][1].push(0.1); //temporary magnitude.
            }
            
            globeseries[0][1].push(body["geoplugin_latitude"]);
            globeseries[0][1].push(body["geoplugin_longitude"]);
            globeseries[0][1].push(0.1); //temporary magnitude.


            var glb = new DAT(this.threeRootElement);
            glb.addData(globeseries[0][1], {
              format: "magnitude",
              name: globeseries[0][0]
            });
            glb.createPoints();
            //  Start the animations on the globe
            glb.animate();
          });
        }
      }
    )
    
  }
  componentWillUnmount() {
    this.threeRootElement.remove();
  }
  getResourcesDirectory() {
    let appPath = require("electron").remote.app.getAppPath();

    if (process.cwd() === appPath) return "./";
    else return process.resourcesPath + "/";
  }
  render() {
    return (
      <div id="nxs-earth" className="earth">
        <div ref={element => (this.threeRootElement = element)} />
      </div>
    );
  }
}
