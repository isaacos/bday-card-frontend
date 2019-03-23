import React, { Component } from 'react';
import { CompactPicker } from 'react-color';

class Canvas extends Component {

  state = {
    radius: 1,
    mouseDown: false,
    color: 'black',
    image: ''
  }

  mouseMoveHelper = (event) => {
    const canvas = this.refs.canvas
    const ctx = canvas.getContext('2d')
    const img = this.refs.image
    if(this.state.mouseDown){
      ctx.beginPath();
      ctx.strokeStyle = this.state.color;
      const rect = canvas.getBoundingClientRect()
      const [cX, cY] = [rect.left, rect.top]

      ctx.arc(event.screenX - cX -25, event.screenY - cY - 100, this.state.radius, 0, 2 * Math.PI);
      ctx.fillStyle = this.state.color;
      ctx.fill()
      ctx.stroke();
    }
  }

  brushChange = (input) => {
    switch(input){
      case '+':
        return this.setState({radius: this.state.radius + 5});
      case '-':
        return this.setState({radius: this.state.radius - 5});
    }
  }

  mouseDownToggle = () => {
    this.setState({mouseDown: !this.state.mouseDown})
  }

  handleChangeComplete = (color) => {
    this.setState({color: color.hex})
  }

  downloadImage = () => {
    //grabs canvas using ID
    let canvas = this.refs.canvas
    canvas.href = canvas.toDataURL("image/png")
    console.log(canvas)
    this.setState({image: canvas.href})
  }



  render () {
    return (
      <div>
        <canvas ref="canvas"
         width={640}
         height={424}
         onMouseDown={()=>this.mouseDownToggle()}
         onMouseUp={()=>this.mouseDownToggle()}
         onMouseMove={e => this.mouseMoveHelper(e)}
        /><br />
        <CompactPicker
        color={this.state.color}
        onChangeComplete={this.handleChangeComplete} />
        <button onClick={() => this.brushChange('+')}>Increase brush radius</button>
        <button onClick={() => this.brushChange('-')}>Decrease brush radius</button>
        <button onClick={() => this.downloadImage()}>download image</button>
        <a href="path-to-image.png" download>
          <img src={this.state.image} />
        </a>
      </div>
    )
  }

}

export default Canvas;
