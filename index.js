import React from "react";
import { render } from "react-dom";
import gql from "graphql-tag";
import ApolloClient from "apollo-boost";
import { ApolloProvider, Query } from "react-apollo";
import chroma from "chroma-js";
import moment from "moment-timezone";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'

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
    const leftOffset = ((this.props.start.hour*60) + this.props.start.minute) / 1440 * 100;
    let width = this.props.duration / 1440 * 100;
    let className = "runBlock";
    let remainder = null;
    if (width + leftOffset > 100) {
      remainder = width + leftOffset - 100;
      width = 100 - leftOffset;
      className += " blockOverlap";
    } 
    let utcToday = moment.tz();
    utcToday.hour(+this.props.label.replace('Z', ''));
    utcToday.minute(0);
    utcToday.second(0);
    utcToday.millisecond(0);
    utcToday.add(this.props.limit, "hours");
    utcToday.tz(moment.tz.guess());

    const originalRunBlock = 
      <div className={className} style={{ left: leftOffset+'%', width: width+'%', backgroundColor: this.props.color }}>
        <div className="runInfo" style={{ borderLeftColor: this.props.color }}>
          <span className="runLabel">{this.props.label}</span>
          <span className="infoRow">
            <span className="infoTitle">Range</span>
            <span className="infoDetail">{utcToday.format('MMM D, ha z')}<br />+{this.props.limit}h</span>
          </span>
        </div>
      </div>;

    if (remainder) {
      return [
        originalRunBlock,
        <div className="runBlock blockRemainder" style={{ left: '0%', width: remainder+'%', backgroundColor: this.props.color }}>
          <div className="runInfo" style={{ borderLeftColor: this.props.color }}>
            <span className="runLabel">{this.props.label}</span>
            <span className="infoRow">
              <span className="infoTitle">Range</span>
              <span className="infoDetail">{utcToday.format('MMM D, ha z')}<br />+{this.props.limit}h</span>
            </span>
          </div>
        </div>
      ]
    }
    return originalRunBlock;
  }
};

class ModelBlock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isToggleOn: false};
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(state => ({
      isToggleOn: !state.isToggleOn
    }));
  }
  render() {
    return (
      <div className={`modelBlock ${this.state.isToggleOn ? 'blockOn' : 'blockOff'}`} onClick={this.handleClick} style={{ backgroundColor: this.props.color+'32'}}>
        <div className="modelInfo">
          <div className="modelName">{this.props.modelData.name}</div>
          <div className="modelDetails">{this.props.modelData.res}km</div>
        </div>
        <div className="runs">
          {this.props.modelData.runs.map((runData) => {
            return <RunBlock color={this.props.color} start={runData.start} duration={runData.duration} label={runData.label} limit={runData.limit} />;
          })}
        </div>
        <div className="modelToggle">
          <div className="modelLinks">
            {this.props.modelData.viewLinks.map((link) => (
              <a href={link} style={{ backgroundColor: this.props.color }} target="_blank">
                <FontAwesomeIcon icon={faLink} /> 
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }
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
    <h1>Forecast Run Schedule<span>Times in UTC</span></h1>
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
