import React from "react";
import { render } from "react-dom";
import gql from "graphql-tag";
import ApolloClient from "apollo-boost";
import { ApolloProvider, Query } from "react-apollo";
import chroma from "chroma-js";
import moment from "moment";

const client = new ApolloClient({
  uri: "https://weather-api.thedeskofmatthew.com/graphql"
});

class TimeTicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      date: new Date()
    };
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      60000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }
  
  tick() {
    this.setState({
      date: new Date()
    });
  }

  render() {
    const hours = this.state.date.getUTCHours();
    const minutes = this.state.date.getUTCMinutes();
    const percent = (((hours*60) + minutes) / 1440) * 100;

    return (
      <div style={{ left: `${percent}%` }} className="timeTicker"></div>
    );
  }
};

class TimeTicks extends React.Component {
  render() {
    const hours = [...Array(24).keys()];

    return (
      <div className="timeTicksHolder">
        {hours.map((hour) => {
          const leftOffset = (hour * 60) / 1440 * 100;
          return (
            <div className="timeTick" style={{ left: `${leftOffset}%` }}>
              <span>{hour.toString().padStart(2, '0')}</span>
            </div>
          );
        })}
      </div>
    );
  }
};

class RunBlock extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      date: new Date()
    };
  }

  render() {
    const left = ((this.props.start.hour*60) + this.props.start.minute) / 1440 * 100;
    const width = this.props.duration / 1440 * 100;
    const today = new Date();

    return (
      <div className="runBlock" style={{ left: left+'%', width: width+'%', backgroundColor: this.props.color }}>
        <div className="runInfo" style={{ color: this.props.color }}>{this.props.label} &bull; Range: +{this.props.limit}</div>
      </div>
    );
  }
};

const ModelBlock = (props) => {
  return (
    <div className="modelBlock" style={{ backgroundColor: props.color+'32'}}>
      <div className="modelInfo">
        <div className="modelName"><a target="_blank" href={props.modelData.viewLinks[0]}>{props.modelData.name}</a></div>
        <div className="modelDetails">{props.modelData.res}km</div>
      </div>
      <div className="runs">
        {props.modelData.runs.map((runData) => {
          return <RunBlock color={props.color} start={runData.start} duration={runData.duration} label={runData.label} limit={runData.limit} />;
        })}
      </div>
    </div>
  );
};

const ModelList = () => (
  <Query
    query={gql`
      {
        models {
          name
          res
          minFrameSize
          viewLinks
          runs {
            label
            start {
              hour
              minute
            }
            duration
            limit
          }
        }
      }
    `}
  >
    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>;
      if (error) return <p>Error :(</p>;
      let scale = chroma.scale(['#fec00f','#2eb0cd']).mode('lch').colors(data.models.length);
      return data.models.map((modelData, idx) => (
        <ModelBlock modelData={modelData} color={scale[idx]} />
      ));
    }}
  </Query>
);

const App = () =>  (
  <ApolloProvider client={client}>
    <TimeTicks />
    <div className="tickerHolder">
      <TimeTicker />
    </div>
    <div className="modelList">
      <ModelList />
    </div>
  </ApolloProvider>
);

render(<App name="Jane" />, document.getElementById("app"));
