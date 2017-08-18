import React from 'react';
import { Dimensions, TouchableWithoutFeedback, Alert, Animated, StyleSheet, Button, Text, View } from 'react-native';

class StartScreen extends React.Component {
  render() {
    return (<View style={{flex: 1, justifyContent: 'center'}}>
        <Button style={styles.startButton} onPress={this.props.startGame} title="Start"/>
      </View>)
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fallDuration: 3000,
      currentScore: 0,
      items: []
    }

    this.screenWidth = Dimensions.get('window').width;
    this.screenHeight = Dimensions.get('window').height;

    this._decreaseFallDuration = this._decreaseFallDuration.bind(this);
    this._endGame = this._endGame.bind(this);
    this._increaseScore = this._increaseScore.bind(this);
    this._addItem = this._addItem.bind(this);
  }

  componentDidMount() {
    this.durationInterval = setInterval(
      () => this._decreaseFallDuration(),
      1000
    );

    this.additionInterval = setInterval(
      () => this._addItem(),
      1000);
  }

  _decreaseFallDuration() {
    clearInterval(this.durationInterval);

    this.setState(function(prevState) {
      return {
        fallDuration: prevState.fallDuration * 0.5
      };
    });
  }

  _addItem() {
    this.state.items.push({});

    this.setState({
      items: this.state.items
    })
  }

  _endGame() {
    clearInterval(this.durationInterval);
    clearInterval(this.additionInterval);
    this.props.endGame(this.state.currentScore);
  }

  _increaseScore() {
    this.setState(function(prevState){
      return {
        currentScore: prevState.currentScore + 1
      };
    });
  }

  render() {
    return (<View style={{flex: 1}}>
      {this.state.items.map((r, i) =>
        <FallingItem duration={this.state.fallDuration} 
          hitBottom={this._endGame}
          increaseScore={this._increaseScore}
          screenHeight={this.screenHeight}
          screenWidth={this.screenWidth}
          key={i}/>
      )}
      </View>);
  }
}

class FallingItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      yPosition: new Animated.Value(0),
      isRemoved: false
    }

    this.xPosition = Math.floor((Math.random() * (this.props.screenWidth - 50)) + 1);

    this.fallingAnimation = Animated.timing(
      this.state.yPosition,
      {
        toValue: this.props.screenHeight - 50,
        duration: this.props.duration
      }                              
    );

    this._removeItem = this._removeItem.bind(this);
  }

  componentDidMount() {
    this.fallingAnimation.start(() => {
      if(this.state.yPosition._value >= (this.props.screenHeight - 50)) {this.props.hitBottom();}});
  }

  _removeItem() {
    this.fallingAnimation.stop();

    this.setState({
      isRemoved: true
    });

    this.props.increaseScore();
  }

  render() {
    if(this.state.isRemoved) {
      return (null);
    }

    return (
        <TouchableWithoutFeedback onPress={this._removeItem}>
          <Animated.View shouldRasterizeIOS={true} renderToHardwareTextureAndroid={true} 
            style={[styles.fallingItemInnerView, {position: 'absolute', left:this.xPosition, top: this.state.yPosition}]}>
          </Animated.View>
        </TouchableWithoutFeedback>
      );
  }
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasStarted: false,
      hasEnded: false
    }
    this._startGame = this._startGame.bind(this);
    this._endGame = this._endGame.bind(this);
    this._restartGame = this._restartGame.bind(this);
  }

  _startGame() {
    this.setState({
      hasStarted: true
    });
  }

  _endGame(finalScore) {
    this.setState({
      hasEnded: true,
      finalScore: finalScore
    });
  }

  _restartGame() {
    this.setState({
      hasEnded: false,
      hasStarted: false
    })
  }

  render() {
    if(this.state.hasEnded) {
      return(<View style={{flex: 1, justifyContent: 'center'}}>
          <Text>Final Score: {this.state.finalScore}</Text>
          <Button onPress={this._restartGame} title="Reset" />
          </View>);
    }
    else if(this.state.hasStarted){
      return (<Game endGame={this._endGame}/>);
    }
    else {
      return(<StartScreen startGame={this._startGame}/>);
    }
  }
}

const styles = StyleSheet.create({
  startButton: {
    marginTop: '500px'
  },
  fallingItemInnerView: {
    width: 50, 
    height: 50, 
    alignItems: 'center', 
    backgroundColor: '#2196F3'
  }
});
