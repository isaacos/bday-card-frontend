import React, { Component } from 'react';
import './App.css';
import Canvas from './components/Canvas.js'

class App extends Component {
  state = {
    scrollOffset: 0
  }
  render() {
    return (
      <div className="App" ref="app" onMouseMove={() => this.setState({scrollOffset: this.refs.app.getBoundingClientRect().top})}>
        <div className="top-row">
        <div className="h1-div">
          <h1>Happy Birthday!</h1>
        </div>
        <div className="h1-right"></div>
        </div>
        <Canvas scrollOffset={this.state.scrollOffset}/>
      </div>
    );
  }
}

export default App;
