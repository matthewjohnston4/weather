import React from "react";
import { render } from "react-dom";
import gql from "graphql-tag";
import ApolloClient from "apollo-boost";
import { ApolloProvider, Query } from "react-apollo";

const client = new ApolloClient({
  uri: "https://weather-api.thedeskofmatthew.com/graphql"
});


const TimeTicker = () => (
  <div className="timeTicker"></div>
);

const ModelBlock = (props) => (
  <div className="modelBlock">{JSON.stringify(props.modelData)}</div>
);

const ModelList = () => (
  <Query
    query={gql`
      {
        models {
          name
          res
          minFrameSize
          runs {
            label
          }
        }
      }
    `}
  >
    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>;
      if (error) return <p>Error :(</p>;

      return data.models.map((modelData) => (
        <ModelBlock modelData={modelData} />
      ));
    }}
  </Query>
);

const App = () =>  (
  <ApolloProvider client={client}>
    <TimeTicker />
    <div className="modelList">
      <ModelList />
    </div>
  </ApolloProvider>
);

render(<App name="Jane" />, document.getElementById("app"));
