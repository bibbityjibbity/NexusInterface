/*
Title: MarkaetDepth
Description: Handle how to draw graph for market depth
Last Modified by: Brian Smith
*/
// External Dependencies
import React, { Component } from 'react'
import {
  VictoryArea,
  VictoryChart,
  VictoryTooltip,
  VictoryAnimation,
  VictoryAxis,
  VictoryPortal,
  VictoryLabel,
  VictoryVoronoiContainer,
} from 'victory'

export default class MarketDepth extends Component {
  // Mandatory React method
  render() {
    return (
      <div className="marketDepthInner">
        <VictoryChart
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
          containerComponent={<VictoryVoronoiContainer />}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={tick => {
              if (tick % 1000000 === 0) {
                return `${tick / 1000}M`
              } else if (tick % 1000 === 0) {
                return `${tick / 1000}K`
              } else {
                return tick
              }
            }}
          />

          <VictoryArea
            style={{
              data: {
                fill: 'url(#green)',
              },
            }}
            labelComponent={<VictoryTooltip />}
            data={[...this.props.chartData]}
          />
          <VictoryArea
            style={{
              data: {
                fill: 'url(#red)',
              },
            }}
            labelComponent={<VictoryTooltip />}
            data={[...this.props.chartSellData]}
          />
          <VictoryAxis
            independentAxis
            style={{ tickLabels: { angle: -15 } }}
            tickLabelComponent={
              <VictoryPortal>
                <VictoryLabel />
              </VictoryPortal>
            }
          />
        </VictoryChart>
        <svg style={{ height: 0 }}>
          <defs>
            <linearGradient id="green" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(38, 230, 0, 0.9)" />
              <stop offset="100%" stopColor=" rgba(38, 230, 0, 0.2)" />
            </linearGradient>
          </defs>
        </svg>
        <svg style={{ height: 0 }}>
          <defs>
            <linearGradient id="red" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(255, 15, 15,0.9)" />
              <stop offset="100%" stopColor=" rgba(255, 15, 15,0.2)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    )
  }
}
