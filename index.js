import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Animated,
  Dimensions,
  View,
  Text,
  StyleSheet
} from 'react-native';

const {height, width} = Dimensions.get('window');

export default class BDToast extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textDimensions: undefined,
      opacityBoard: new Animated.Value(0),
      opacityText: new Animated.Value(0),
      text: undefined
    };
    this.animating = false;
  }

  show(text, delay=1000, duration=500) {
    if (this.animating) {
      return;
    }

    this.setState({
      text: text
    });

    Animated.parallel([
      Animated.sequence([
        Animated.timing(this.state.opacityBoard, {
          delay: 100,
          toValue: .8,
          duration: duration
        }),
        Animated.timing(this.state.opacityBoard, {
          delay: delay,
          toValue: 0.,
          duration: duration
        })
      ]),
      Animated.sequence([
        Animated.timing(this.state.opacityText, {
          delay: 100,
          toValue: 1.,
          duration: duration
        }),
        Animated.timing(this.state.opacityText, {
          delay: delay,
          toValue: 0.,
          duration: duration
        })
      ])
    ]).start(this._onCompleteAnimation);

    this.animating = true;
  }

  _onCompleteAnimation = () => {
    if (this.props.onDisappear) {
      this.props.onDisappear(this.props.id);
    }
    this.animating = false;
    this.setState({
      text: undefined
    });
  };

  _onLayout = (event) => {
    if (!this.state.text || this.state.textDimensions) {
      return;
    }

    let textDimensions = {
      height: event.nativeEvent.layout.height,
      width: event.nativeEvent.layout.width,
      left: (width - event.nativeEvent.layout.width) * .5
    };

    if (this.props.positionFromTop) {
      textDimensions.top = (height - textDimensions.height) * this.props.positionFromTop;
    }

    textDimensions.bottom = (height - textDimensions.height) * this.props.positionFromBottom;

    this.setState({
      textDimensions: textDimensions
    });
  };

  render() {
    if (!this.state.text) {
      return (
        <View />
      );
    }

    if (!this.state.textDimensions) {
      return (
        <View style={styles.containerBasicBefore}>
          <View onLayout={this._onLayout} style={{padding: 10, marginHorizontal: 20}}>
            <Text style={[styles.textDefault, this.props.styleText]}>
              {this.state.text}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.containerBasicAfter, this.state.textDimensions]}>
        <Animated.View style={[styles.boardDefault, this.props.styleBoard, styles.containerFrame, {opacity: this.state.opacityBoard}]} />
        <Animated.View style={[styles.containerFrame, {backgroundColor: 'transparent', opacity: this.state.opacityText}]}>
          <View style={styles.textContainer}>
            <Text style={[styles.textDefault, this.props.styleText]}>
              {this.state.text}
            </Text>
          </View>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerBasicBefore: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.
  },
  containerBasicAfter: {
    position: 'absolute',
    opacity: 1.
  },
  containerFrame: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    padding: 10
  },
  boardDefault: {
    backgroundColor: 'black',
    borderRadius: 5
  },
  textContainer : {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textDefault: {
    color: 'white',
    fontSize: 14,
    textAlign: 'justify'
  }
});

BDToast.defaultProps = {
  id: undefined,
  onDisappear: undefined,
  positionFromBottom: .05,
  styleBoard: {},
  styleText: {}
};

BDToast.propTypes = {
  id: PropTypes.number,
  onDisappear: PropTypes.func,
  positionFromBottom: PropTypes.number,
  positionFromTop: PropTypes.number,
  styleBoard: PropTypes.object,
  styleText: PropTypes.object
};
