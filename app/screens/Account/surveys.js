import React, { Component } from "react";
import { TouchableOpacity, View } from "react-native";
import { NavigationActions } from "react-navigation";
import { connect } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";

import { clearLocalSurveys } from "../../actions";
import { Text, Wrapper } from "../../components";
import { selectAvailableSurveys } from "../../selectors";
import { baseStyles } from "../../styles";
import LocalSurveyList from "./LocalSurveyList";
import SurveyModal from "./surveyChoose";

class SurveysScreen extends Component {
  state = {
    showModal: false
  };

  onBackPress = () => this.props.navigation.dispatch(NavigationActions.back());

  hideModal = () =>
    this.setState({
      showModal: false
    });

  showModal = () =>
    this.setState({
      showModal: true
    });

  // uncomment this to clear local surveys when displaying this screen
  // componentWillMount() {
  //   this.props.clearLocalSurveys();
  // }

  render() {
    const { availableSurveys, navigation } = this.props;
    const { showModal } = this.state;

    const headerView = (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center"
        }}
      >
        <TouchableOpacity onPress={this.onBackPress}>
          <Icon
            name="keyboard-backspace"
            style={[[baseStyles.headerBackIcon]]}
          />
        </TouchableOpacity>
        <Text style={[baseStyles.h3, baseStyles.headerTitle]}>Surveys</Text>
      </View>
    );

    return (
      <Wrapper navigation={navigation} headerView={headerView}>
        {showModal && <SurveyModal close={this.hideModal} />}

        <LocalSurveyList navigation={navigation} surveys={availableSurveys} />

        {/* TODO this covers up part of a listed survey */}
        <View style={{ position: "relative" }}>
          <TouchableOpacity
            style={[baseStyles.buttonBottom, { alignSelf: "flex-end" }]}
            onPress={this.showModal}
          >
            <Text style={[baseStyles.textWhite]}>
              {"Add New Surveys".toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </Wrapper>
    );
  }
}

const mapStateToProps = state => ({
  availableSurveys: selectAvailableSurveys(state)
});

export default connect(mapStateToProps, { clearLocalSurveys })(SurveysScreen);
