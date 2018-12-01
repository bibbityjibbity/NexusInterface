/*
Title: Candlestick
Description: Handle how to draw candle sticks
Last Modified by: Brian Smith
*/

// External Dependencies
import React, { Component } from 'react'
import {
  VictoryChart,
  VictoryAxis,
  VictoryCandlestick,
  VictoryPortal,
  VictoryLabel,
  VictoryTooltip,
} from 'victory'

export default class Candlestick extends Component {
  // Mandatory React method
  render() {
    return (
      <div className="marketDepthInner">
        <VictoryChart
          domainPadding={{ x: 10 }}
          theme={{
            axis: {
              style: {
                axis: {
                  fill: 'transparent',
                  stroke: 'white',
                  strokeWidth: 1,
                },
                axisLabel: {
                  textAnchor: 'right',
                  padding: 25,
                },
                grid: {
                  fill: 'none',
                  stroke: 'none',
                  pointerEvents: 'painted',
                },
                ticks: {
                  fill: 'white',
                  size: 5,
                  stroke: 'white',
                },
                tickLabels: {
                  padding: 1,
                  fill: 'white',
                  stroke: 'transparent',
                },
              },
            },
          }}
        >
          <VictoryAxis
            tickFormat={t =>
              `${new Date(t).getDate()}/${new Date(t).getMonth() + 1}`
            }
            tickLabelComponent={
              <VictoryPortal>
                <VictoryLabel />
              </VictoryPortal>
            }
          />

          <VictoryAxis dependentAxis style={{ tickLabels: { angle: -45 } }} />
          <VictoryCandlestick
            style={{ data: { stroke: 'white' } }}
            candleColors={{
              positive: 'rgba(38, 230, 0, 1)',
              negative: 'rgba(255, 15, 15, 1)',
            }}
            data={this.props.data}
            labelComponent={<VictoryTooltip />}
          />
        </VictoryChart>
      </div>
    )
  }
}
