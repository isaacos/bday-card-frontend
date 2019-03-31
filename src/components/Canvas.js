import React, { Component } from 'react';
import { CompactPicker } from 'react-color';

class Canvas extends Component {

  state = {
    radius: 1,
    mouseDown: false,
    color: 'black',
    image: '',
    email: '',
    startX: null,
    startY: null
  }

  mouseMoveHelper = (event) => {
    this.setState({startX: event.clientX, startY: event.clientY})
    const img = this.refs.image
    if(this.state.mouseDown){
    this.drawLine(event)
    }
  }

  onMouseDownHelper = (event) => {
    this.setState({mouseDown: true})
    this.drawLine(event, 14)
  }

  drawLine = (event, minusClientX =15) => {
    const canvas = this.refs.canvas
    const ctx = canvas.getContext('2d')
    ctx.lineJoin = 'round' //turn to line
    ctx.lineWidth = this.state.radius
    ctx.beginPath();
    ctx.strokeStyle = this.state.color;
    ctx.moveTo(this.state.startX -15, this.state.startY)
    ctx.lineTo(event.clientX -minusClientX, event.clientY)
    this.setState({startX: event.clientX, startY: event.clientY})
    ctx.closePath()
    ctx.stroke();

  }

  brushChange = (input) => {
    switch(input){
      case '+':
        return this.setState({radius: this.state.radius + 5});
      case '-':
        return this.setState({radius: this.state.radius - 5});
    }
  }

  mouseDownFalse = () => {
    this.setState({mouseDown: false})
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
    console.log(canvas.href)
  }

  mailTo = () => {
    fetch('http://localhost:3000/mail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: this.state.email,
        url: this.state.image
      })
    })
.then(response => response.json())
.then(response => console.log(response))
  }


  render () {
    return (
      <div>
        <canvas ref="canvas"
         width={640}
         height={424}
         onMouseDown={e=>this.onMouseDownHelper(e)}
         onMouseUp={()=>this.mouseDownFalse()}
         onMouseMove={e => this.mouseMoveHelper(e)}
         onMouseOut={() => this.mouseDownFalse()}
        /><br />
        <CompactPicker
        color={this.state.color}
        onChangeComplete={this.handleChangeComplete} />
        <button onClick={() => this.brushChange('+')}>Increase brush radius</button>
        <button onClick={() => this.brushChange('-')}>Decrease brush radius</button>
        <button onClick={() => this.downloadImage()}>download image</button>
        <input type="email" placeholder="email" onChange={event => this.setState({email: event.target.value})} />
        <a href="path-to-image.png" onClick={() => this.mailTo()} >
          <img src={this.state.image} />
        </a>
      </div>
    )
  }

}

export default Canvas;
