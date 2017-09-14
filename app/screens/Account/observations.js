import React, { Component } from "react";
import { StyleSheet, View, ListView, TouchableOpacity } from "react-native";
import Mapbox, { MapView } from "react-native-mapbox-gl";
import Icon from "react-native-vector-icons/MaterialIcons";
import { connect } from "react-redux";
import { format } from "date-fns";
import { Link } from "react-router-native";

import {
  pickSurvey,
  calculateCompleteness
} from "../../lib/calculate-completeness";

import {
  syncData,
  setActiveObservation,
  getPeerInfo,
  osm
} from "../../actions";
import { selectFeatureTypes } from "../../selectors";
import {
  Text,
  Wrapper,
  PercentComplete,
  Map,
  AnnotationObservation
} from "../../components";
import { baseStyles } from "../../styles";

class AccountObservations extends Component {
  componentWillMount() {
    const { deviceId, types } = this.props;

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });

    this.setState({ observations: ds.cloneWithRows([]) });

    osm.getObservationsByDeviceId(deviceId, (err, results) => {
      let resultsWithCompleteness = results.map(result => {
        let survey = pickSurvey(types, result);
        let percentage = calculateCompleteness(survey, result);
        result.percentage = percentage;
        return result;
      });

      this.setState({
        observations: ds.cloneWithRows(resultsWithCompleteness)
      });
    });
  }

  onPressSync = () => {
    this.props.syncData(this.props.coordinatorTarget);
  };

  renderLastSynced = () => {
    const styles = [
      baseStyles.wrappedItems,
      baseStyles.wrappedItemsLeft,
      baseStyles.syncHeaderText
    ];

    if (this.props.observationsLastSynced) {
      return (
        <View style={styles}>
          <Text style={{ fontSize: 12 }}>Last Synced: </Text>
          <Text style={{ fontSize: 12 }}>
            {format(
              this.props.observationsLastSynced,
              "h:mm aa ddd, MMM D, YYYY"
            )}
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles}>
          <Text style={{ fontSize: 12 }}>Never Synced</Text>
        </View>
      );
    }
  };

  render() {
    const { history, setActiveObservation } = this.props;

    const headerView = (
      <View style={[baseStyles.mainHeader]}>
        <Link to="/">
          <Icon
            name="keyboard-backspace"
            style={[[baseStyles.headerBackIcon]]}
          />
        </Link>

        <Text style={[baseStyles.h3, baseStyles.headerTitle]}>
          My Observations
        </Text>
      </View>
    );

    const { observations } = this.state;

    return (
      <Wrapper style={[baseStyles.mainHeaderSpace]} headerView={headerView}>
        <View style={[baseStyles.wrapperContentSm]}>
          <View style={[baseStyles.wrappedItems, baseStyles.syncHeader]}>
            {this.renderLastSynced()}

            <TouchableOpacity
              style={[baseStyles.buttonContent]}
              onPress={this.onPressSync}
            >
              <Text style={[baseStyles.textWhite]}>Sync Data</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ListView
          style={[baseStyles.listView]}
          dataSource={observations}
          noScroll={true}
          renderRow={item => {
            // TODO: calculate based on number of tags in survey
            const percentage = item.percentage + "%";
            const complete = parseInt(item.percentage / 10, 10);
            const incomplete = 10 - complete;

            return (
              <View style={[baseStyles.wrapperContent]}>
                <TouchableOpacity
                  style={[baseStyles.surveyCard]}
                  onPress={() => {
                    setActiveObservation(item);

                    history.push({
                      pathname: `/observation/${item.tags.surveyId}/${item.tags
                        .surveyType}`
                    });
                  }}
                >
                  <View>
                    <Map
                      center={{ latitude: item.lat, longitude: item.lon }}
                      zoom={16}
                    >
                      <AnnotationObservation
                        id={item.id}
                        coordinates={{
                          latitude: item.lat,
                          longitude: item.lon
                        }}
                      />
                    </Map>

                    {
                      <PercentComplete
                        radius={35}
                        complete={complete}
                        incomplete={incomplete}
                      >
                        <Text style={[baseStyles.percentCompleteTextSm]}>
                          <Text style={[baseStyles.percentCompleteTextNumSm]}>
                            {percentage}
                          </Text>
                        </Text>
                      </PercentComplete>
                    }

                    <View style={[baseStyles.surveyCardContent]}>
                      <Text
                        style={[
                          baseStyles.h3,
                          baseStyles.headerWithDescription,
                          baseStyles.headerLink
                        ]}
                      >
                        Observation
                      </Text>
                      <View style={[baseStyles.spaceBelow]}>
                        <View
                          style={[baseStyles.wrappedItems, baseStyles.spacer]}
                        >
                          <Text>
                            Updated:{" "}
                            {format(item.timestamp, "h:mm aa ddd, MMM D, YYYY")}
                          </Text>
                        </View>
                        <Text>
                          {item.surveyName}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </Wrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    types: selectFeatureTypes(state),
    observationsLastSynced: state.coordinator.observationsLastSynced,
    coordinatorTarget: state.coordinator.coordinatorTarget,
    deviceId: state.user.deviceId
  };
};

export default connect(mapStateToProps, { syncData, setActiveObservation })(
  AccountObservations
);
