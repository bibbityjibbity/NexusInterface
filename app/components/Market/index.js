import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import ReactTable from "react-table";

import styles from "./style.css";
import * as TYPE from "../../actions/actiontypes";
import MarketDepth from "../Chart/MarketDepth";
import Candlestick from "../Chart/Candlestick";

// import images
import bittrexLogo from "../../images/BittrexLogo.png";
import binanceLogo from "../../images/BINANCE.png";
import cryptopiaLogo from "../../images/CryptopiaLogo.png";
import * as actionsCreators from "../../actions/marketActionCreators";
import binanceSmallLogo from "../../images/binanceSmallLogo.png";
import bittrexSmallLogo from "../../images/bittrexSmallLogo.png";
import cryptopiaSmallLogo from "../../images/cryptopiaSmallLogo.png";
import arrow from "../../images/arrow.png";

import { VictoryArea, VictoryChart, VictoryAnimation } from "victory";

const mapStateToProps = state => {
  return { ...state.market };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(actionsCreators, dispatch);

class Market extends Component {
  // thunk API calls to the exchanges
  componentDidMount() {
    this.refresher();
  }

  refresher() {
    this.props.binanceDepthLoader();
    this.props.bittrexDepthLoader();
    this.props.cryptopiaDepthLoader();
    this.props.binanceCandlestickLoader();
    this.props.bittrexCandlestickLoader();
    this.props.cryptopiaCandlestickLoader();
  }

  arbitageAlert() {
    let lowArr = [],
      highArr = [],
      arbArr = [[], [], []];

    let sellArr = [],
      buyArr = [];
    if (this.props.binance.sell[0]) {
      sellArr.push({
        exchange: "binance",
        fee: 0.001,
        arr: this.props.binance.sell
      });
    }
    if (this.props.bittrex.sell[0]) {
      sellArr.push({
        exchange: "bittrex",
        fee: 0.0025,
        arr: this.props.bittrex.sell
      });
    }
    if (this.props.cryptopia.sell[0]) {
      sellArr.push({
        exchange: "cryptopia",
        fee: 0.002,
        arr: this.props.cryptopia.sell
      });
    }
    if (this.props.binance.sell[0]) {
      buyArr.push({
        exchange: "binance",
        fee: 0.001,
        arr: this.props.binance.buy
      });
    }
    if (this.props.bittrex.sell[0]) {
      buyArr.push({
        exchange: "bittrex",
        fee: 0.0025,
        arr: this.props.bittrex.buy
      });
    }
    if (this.props.cryptopia.sell[0]) {
      buyArr.push({
        exchange: "cryptopia",
        fee: 0.002,
        arr: this.props.cryptopia.buy
      });
    }
    const compBuyArr = buyArr.map(obj => {
      let volAgra = 0,
        i = 0,
        priceAgra = 0;
      while (volAgra < 1000) {
        priceAgra = obj.arr[i].Price + priceAgra;
        volAgra = obj.arr[i].Volume + volAgra;
        ++i;
      }
      return {
        exchange: obj.exchange,
        priceAverage: priceAgra / i,
        fee: obj.fee,
        volAgra: volAgra,
        buy: true
      };
    });
    const compSellArr = sellArr.map(obj => {
      let volAgra = 0,
        i = 0,
        priceAgra = 0;
      while (volAgra < 1000) {
        priceAgra = obj.arr[i].Price + priceAgra;
        volAgra = obj.arr[i].Volume + volAgra;
        ++i;
      }
      return {
        exchange: obj.exchange,
        fee: obj.fee,
        priceAverage: priceAgra / i,
        volAgra: volAgra,
        buy: false
      };
    });

    const placeholderVolume = 1;
    const placeholderTreshold = -0.0001;
    let potentialAlerts = compBuyArr
      .map((high, i1) => {
        return compSellArr
          .map((low, i2) => {
            if (high.exchange !== low.exchange) {
              let sellNXS =
                high.priceAverage * placeholderVolume -
                high.priceAverage * placeholderVolume * high.fee;
              let buyNXS =
                placeholderVolume * low.priceAverage -
                placeholderVolume * low.priceAverage * low.fee;

              let deltaBTC = sellNXS - buyNXS;

              if (deltaBTC > placeholderTreshold) {
                console.log("ARBITRAGE!!!");
                let highsrc, lowsrc;
                switch (high.exchange) {
                  case "binance":
                    highsrc = binanceSmallLogo;
                    break;
                  case "bittrex":
                    highsrc = bittrexSmallLogo;
                    break;
                  case "cryptopia":
                    highsrc = cryptopiaSmallLogo;
                    break;
                  default:
                    break;
                }
                switch (low.exchange) {
                  case "binance":
                    lowsrc = binanceSmallLogo;
                    break;
                  case "bittrex":
                    lowsrc = bittrexSmallLogo;
                    break;
                  case "cryptopia":
                    lowsrc = cryptopiaSmallLogo;
                    break;
                  default:
                    break;
                }

                return (
                  <div className="arbitrageAlert" key={`${i1}${i2}`}>
                    <div>ARBITRAGE ALERT!</div>
                    <span onClick={() => this.closeAlert(this)}>X</span>
                    <div>
                      <img src={highsrc} alt={high.exchange} />
                      <img src={arrow} alt="right pointing arrow" />
                      <img src={lowsrc} alt={low.exchange} />
                    </div>
                    <div>
                      {deltaBTC.toFixed(8)} profit on a {placeholderVolume} NXS
                      trade
                    </div>
                  </div>
                );
                // {
                //   fromExcange: high.exchange,
                //   fromPriceAve: high.priceAverage,
                //   toPriceAve: low.priceAverage,
                //   maxVol: maxVol,
                //   fromFee: low.fee,
                //   toFee: high.fee,
                //   deltaP: parseFloat(deltaP.toFixed(8)),
                //   toExchange: low.exchange
                // };
              } else return null;
            }
          })
          .filter(e => {
            if (e) {
              return e;
            }
          });
      })
      .filter(e => {
        if (e.length != 0) {
          return e;
        }
      });
    let alerts;
    if (potentialAlerts.length > 0) {
      alerts = potentialAlerts.reduce((accumulator, currentValue) =>
        accumulator.concat(currentValue)
      );
    }

    console.log(alerts);
    return alerts;
  }

  closeAlert(thing) {
    console.log(thing);
  }

  formatBuyData(array) {
    let newQuantity = 0;
    let prevQuantity = 0;
    let finnishedArray = array
      .map(e => {
        newQuantity = prevQuantity + e.Volume;
        prevQuantity = newQuantity;
        if (e.Price < array[0].Price * 0.05) {
          return {
            x: 0,
            y: newQuantity
          };
        } else {
          return {
            x: e.Price,
            y: newQuantity,
            label: `Price: ${e.Price} \n Volume: ${newQuantity}`
          };
        }
      })
      .filter(e => e.x > 0);

    return finnishedArray;
  }

  formatChartData(exchange) {
    const dataSetArray = [];
    switch (exchange) {
      case "binanceBuy":
        return [...this.formatBuyData(this.props.binance.buy)];
        break;
      case "binanceSell":
        return [...this.formatBuyData([...this.props.binance.sell].reverse())];
        break;
      case "bittrexBuy":
        return [...this.formatBuyData(this.props.bittrex.buy)];
        break;
      case "bittrexSell":
        return [...this.formatBuyData([...this.props.bittrex.sell].reverse())];
        break;
      case "cryptopiaBuy":
        return [...this.formatBuyData(this.props.cryptopia.buy)];
        break;
      case "cryptopiaSell":
        return [
          ...this.formatBuyData([...this.props.cryptopia.sell].reverse())
        ];
        break;
      default:
        return [];
        break;
    }
    return [...this.formatBuyData(this.props.binance.buy)];
  }

  render() {
    return (
      <div id="Market">
        <div id="marketHeadliner">
          <h2 onClick={() => this.refresher()}>Market Information</h2>
          <div className="alertbox">{this.arbitageAlert()}</div>
        </div>
        {this.props.loaded &&
          this.props.binance.buy[0] && (
            <div className="exchangeUnitContainer">
              <img className="exchangeLogo" src={binanceLogo} />
              <div className="marketInfoContainer">
                <MarketDepth
                  chartData={this.formatChartData("binanceBuy")}
                  chartSellData={this.formatChartData("binanceSell")}
                />
                {this.props.binance.candlesticks[0] && (
                  <Candlestick data={this.props.binance.candlesticks} />
                )}
              </div>
            </div>
          )}
        {this.props.loaded &&
          this.props.bittrex.buy[0] && (
            <div className="exchangeUnitContainer">
              <img className="exchangeLogo" src={bittrexLogo} />
              <div className="marketInfoContainer">
                <MarketDepth
                  chartData={this.formatChartData("bittrexBuy")}
                  chartSellData={this.formatChartData("bittrexSell")}
                />
                {this.props.bittrex.candlesticks[0] && (
                  <Candlestick data={this.props.bittrex.candlesticks} />
                )}
              </div>
            </div>
          )}
        {this.props.loaded &&
          this.props.cryptopia.buy[0] && (
            <div className="exchangeUnitContainer">
              <img className="excangeLogo" src={cryptopiaLogo} />
              <div className="marketInfoContainer">
                <MarketDepth
                  chartData={this.formatChartData("cryptopiaBuy")}
                  chartSellData={this.formatChartData("cryptopiaSell")}
                />

                {this.props.cryptopia.candlesticks[0] && (
                  <Candlestick data={this.props.cryptopia.candlesticks} />
                )}
              </div>
            </div>
          )}
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Market);
// withAlert()
