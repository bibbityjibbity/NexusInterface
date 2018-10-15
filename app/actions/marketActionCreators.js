import Request from "request";
import * as TYPE from "./actiontypes";
import { FormattedMessage } from "react-intl";
import React from "react";
import locale from "../reducers/intl";
import messages from "../containers/messages";
//action creator for loaded flag

export const marketDataLoaded = () => {
  return { type: TYPE.MARKET_DATA_LOADED };
};

// action creators for the alert list

export const setAlertList = list => {
  return dispatch => {
    dispatch({ type: TYPE.SET_ALERTS, payload: list });
  };
};

export const removeAlert = index => {
  return dispatch => {
    dispatch({ type: TYPE.REMOVE_ALERT, payload: index });
  };
};

// action creators for the 24 hr market summery requests

export const binance24hrInfo = () => {
  return dispatch => {
    Request(
      {
        url: "https://api.binance.com/api/v1/ticker/24hr?symbol=NXSBTC",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          // let data= body.result[0];
          let res = {
            change: body.priceChange,
            high: body.highPrice,
            low: body.lowPrice,
            volume: body.volume
          };
          dispatch({ type: TYPE.BINANCE_24, payload: res });
        }
      }
    );
  };
};

export const bittrex24hrInfo = () => {
  return dispatch => {
    Request(
      {
        url:
          "https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-nxs",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let data = body.result[0];
          let res = {
            change: (data.Last - data.PrevDay) / data.Last,
            high: data.High,
            low: data.Low,
            volume: data.Volume
          };
          dispatch({ type: TYPE.BITTREX_24, payload: res });
        }
      }
    );
  };
};

export const cryptopia24hrInfo = () => {
  return dispatch => {
    Request(
      {
        url: "https://www.cryptopia.co.nz/api/GetMarket/NXS_BTC",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let data = body.Data;
          let res = {
            change: data.Change,
            high: data.High,
            low: data.Low,
            volume: data.Volume
          };
          dispatch({ type: TYPE.CRYPTOPIA_24, payload: res });
        }
      }
    );
  };
};

// action creators for the market depth calls

export const binanceDepthLoader = () => {
  return dispatch => {
    Request(
      {
        url: "https://api.binance.com/api/v1/depth?symbol=NXSBTC",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let res = {
            sell: body.asks
              .map(ele => {
                return {
                  Volume: parseFloat(ele[1]),
                  Price: parseFloat(ele[0])
                };
              })
              .sort((a, b) => b.Price - a.Price)
              .reverse(),
            buy: body.bids
              .map(ele => {
                return {
                  Volume: parseFloat(ele[1]),
                  Price: parseFloat(ele[0])
                };
              })
              .sort((a, b) => b.Price - a.Price)
          };

          dispatch({ type: TYPE.BINANCE_ORDERBOOK, payload: res });
          dispatch(marketDataLoaded());
        }
      }
    );
  };
};

export const cryptopiaDepthLoader = () => {
  return dispatch => {
    Request(
      {
        url: "https://www.cryptopia.co.nz/api/GetMarketOrders/NXS_BTC",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let res = {
            buy: body.Data.Buy.sort((a, b) => b.Price - a.Price).map(e => {
              return { Volume: e.Volume, Price: e.Price };
            }),
            sell: body.Data.Sell.sort((a, b) => b.Price - a.Price)
              .map(e => {
                return { Volume: e.Volume, Price: e.Price };
              })
              .reverse()
          };
          dispatch({ type: TYPE.CRYPTOPIA_ORDERBOOK, payload: res });
          dispatch(marketDataLoaded());
        }
      }
    );
  };
};

export const bittrexDepthLoader = () => {
  return dispatch => {
    Request(
      {
        url:
          "https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-NXS&type=both",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let res = {
            buy: body.result.buy.sort((a, b) => b.Rate - a.Rate).map(e => {
              return { Volume: e.Quantity, Price: e.Rate };
            }),
            sell: body.result.sell
              .sort((a, b) => b.Rate - a.Rate)
              .map(e => {
                return { Volume: e.Quantity, Price: e.Rate };
              })
              .reverse()
          };
          dispatch({ type: TYPE.BITTREX_ORDERBOOK, payload: res });
          dispatch(marketDataLoaded());
        }
      }
    );
  };
};

// actions creators for candlestick data

export const binanceCandlestickLoader = any => {
  console.log(any);
  return dispatch => {
    Request(
      {
        url: "https://api.binance.com/api/v1/klines?symbol=NXSBTC&interval=1d",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let res = body
            .reverse()
            .map(e => {
              return {
                x: new Date(e[0]),
                open: parseFloat(e[1]),
                close: parseFloat(e[4]),
                high: parseFloat(e[2]),
                low: parseFloat(e[3]),
                label: `${
                  messages[any.props.locale]["Market.Date"]
                }: ${new Date(e[0]).getMonth() + 1}/${new Date(
                  e[0]
                ).getDate()}/${new Date(e[0]).getFullYear()}
             ${messages[any.props.locale]["Market.Open"]}: ${parseFloat(e[1])}
             ${messages[any.props.locale]["Market.Close"]}: ${parseFloat(e[4])}
             ${messages[any.props.locale]["Market.High"]}: ${parseFloat(e[2])}
              ${messages[any.props.locale]["Market.Low"]}: ${parseFloat(e[3])}`
              };
            })
            .slice(0, 30);
          dispatch({ type: TYPE.BINANCE_CANDLESTICK, payload: res });
          dispatch(marketDataLoaded());
        }
      }
    );
  };
};

export const bittrexCandlestickLoader = any => {
  return dispatch => {
    Request(
      {
        url:
          "https://bittrex.com/api/v2.0/pub/market/GetTicks?marketName=BTC-NXS&tickInterval=day",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let res = body.result
            .reverse()
            .map(e => {
              return {
                x: new Date(e.T),
                open: e.O,
                close: e.C,
                high: e.H,
                low: e.L,
                label: `${
                  messages[any.props.locale]["Market.Date"]
                }: ${new Date(e.T).getMonth() + 1}/${new Date(
                  e.T
                ).getDate()}/${new Date(e.T).getFullYear()}
                ${messages[any.props.locale]["Market.Open"]}: ${e.O}
                ${messages[any.props.locale]["Market.Close"]}: ${e.C}
                ${messages[any.props.locale]["Market.High"]}: ${e.H}
                ${messages[any.props.locale]["Market.Low"]}: ${e.L}`
              };
            })
            .slice(0, 30);
          dispatch({ type: TYPE.BITTREX_CANDLESTICK, payload: res });
          dispatch(marketDataLoaded());
        }
      }
    );
  };
};

export const cryptopiaCandlestickLoader = any => {
  return dispatch => {
    Request(
      {
        url:
          "https://www.cryptopia.co.nz/Exchange/GetTradePairChart?tradePairId=3983&dataRange=1&dataGroup=1440",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          if (body.Candle) {
            let res = body.Candle.reverse()
              .map(e => {
                return {
                  x: new Date(e[0]),
                  open: e[1],
                  close: e[4],
                  high: e[2],
                  low: e[3],
                  label: `${
                    messages[any.props.locale]["Market.Date"]
                  }: ${new Date(e[0]).getMonth() + 1}/${new Date(
                    e[0]
                  ).getDate()}/${new Date(e[0]).getFullYear()}
                  ${messages[any.props.locale]["Market.Open"]}: ${e[1]}
                  ${messages[any.props.locale]["Market.Close"]}: ${e[4]}
                  ${messages[any.props.locale]["Market.High"]}: ${e[2]}
                  ${messages[any.props.locale]["Market.Low"]}: ${e[3]}`
                };
              })
              .slice(0, 30);
            dispatch({ type: TYPE.CRYPTOPIA_CANDLESTICK, payload: res });
            dispatch(marketDataLoaded());
          }
        }
      }
    );
  };
};
