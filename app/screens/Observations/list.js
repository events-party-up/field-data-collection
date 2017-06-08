import React, { Component } from "react";
import { StyleSheet, View, ListView } from "react-native";
import { getTheme } from "react-native-material-kit";

import { Text, Header, Wrapper } from "../../components";
import { baseStyles } from "../../styles";

const styles = StyleSheet.create({
  observation: {
    backgroundColor: "white",
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginBottom: 5,
    flex: 1
  },
  muted: {
    color: "#bbb"
  },
  title: {
    fontSize: 15,
    fontWeight: "bold"
  }
});

class ObservationListScreen extends Component {
  constructor() {
    super();

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });

    this.state = {
      observations: ds.cloneWithRows([
        {
          category: "Oil spill",
          surveyName: "Survey name",
          observationName: "Name of observation",
          updated: "Sep. 2, 2016",
          lnglat: [47, -122],
          complete: 0.7
        },
        {
          category: "Oil spill",
          surveyName: "Survey name",
          observationName: "Name of observation",
          updated: "Sep. 2, 2016",
          lnglat: [47, -122],
          complete: 0.7
        },
        {
          category: "Oil spill",
          surveyName: "Survey name",
          observationName: "Name of observation",
          updated: "Sep. 2, 2016",
          lnglat: [47, -122],
          complete: 0.7
        }
      ])
    };
  }

  render() {
    const { navigate } = this.props.navigation;

    return (
      <Wrapper style={{ padding: 0 }}>
        <View style={{ flex: 1 }}>
          <Header
            button="map"
            onTogglePress={() => {
              navigate("ObservationMap");
            }}
          />

          <View style={[baseStyles.container]}>
            <ListView
              contentContainerStyle={{}}
              dataSource={this.state.observations}
              renderRow={item => {
                console.log("obs list item", item.observationName);
                return (
                  <View>
                    <View
                      style={{
                        padding: 10,
                        margin: 5,
                        borderRadius: 2,
                        elevation: 1
                      }}
                    >
                      <Text>
                        {item.observationName}
                      </Text>

                      {/*<Text style={styles.muted}>
                        {item.category} | {item.surveyName}
                      </Text>*/}

                      <Text style={styles.muted}>
                        Last updated: {item.updated}
                      </Text>

                      <Text>Lat/Long: {item.lnglat}</Text>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        </View>
      </Wrapper>
    );
  }
}

export default ObservationListScreen;
