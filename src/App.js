import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Canvas from './components/Canvas.js'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="top-row">
        <div className="h1-div">
          <h1>Happy Birthday!</h1>
        </div>
        <div className="h1-right"></div>
        </div>
        <Canvas />
      </div>
    );
  }
}

export default App;
