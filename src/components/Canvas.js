import React, { Component } from 'react';

class Canvas extends Component {

  componentDidMount() {
  }

  mouseMoveHelper = (event) => {
    const canvas = this.refs.canvas
    const ctx = canvas.getContext('2d')
    const img = this.refs.image
    const other =   <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />

    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    const rect = canvas.getBoundingClientRect()
    const [cX, cY] = [rect.left, rect.top]

    //ctx.moveTo(event.screenX, event.screenY);
    ctx.beginPath();
ctx.arc(event.screenX - cX, event.screenY - cY - 80, 10, 0, 2 * Math.PI);
ctx.stroke();

  console.log(event.screenX)

  }

  render () {
    return (
      <div>
        <canvas ref="canvas" width={640} height={424} onMouseMove={e => this.mouseMoveHelper(e)} />

      </div>
    )
  }

}

export default Canvas;
