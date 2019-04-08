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
    startY: null,
    newestLines: [],
    previousLines: [],
    undoneLines: [],
    undraw: true,
    redraw: true
  }

  mouseMoveHelper = (event) => {
    this.setState({startX: event.clientX, startY: event.clientY})
    if(this.state.mouseDown){
    this.drawLine(event)
    }
  }

  onMouseDownHelper = (event) => {
    this.setState({mouseDown: true})
    this.drawLine(event, 1)
  }

  drawLine = (event, minusClientX =0) => {
    const offsetLeft = this.refs.canvas.offsetLeft
    let storedLine = {startX: this.state.startX - offsetLeft, startY: this.state.startY, clientX:  event.clientX - minusClientX - offsetLeft, clientY: event.clientY, color: this.state.color, radius: this.state.radius}
    this.drawHelper(storedLine)
    let newLines =  [...this.state.previousLines, storedLine]
    this.setState({previousLines: newLines})
  }

  redrawAll = (prevLines) => {
    prevLines.forEach(lineObj =>{
      this.drawHelper(lineObj)
    })
  }

  drawHelper = (lineObj) => {
    const canvas = this.refs.canvas
    const ctx = canvas.getContext('2d')
    ctx.lineJoin = 'round' //turn to line
    ctx.lineWidth = lineObj['radius']
    ctx.beginPath();
    ctx.strokeStyle = lineObj['color'];
    ctx.moveTo(lineObj['startX'], lineObj['startY'])
    ctx.lineTo(lineObj['clientX'], lineObj['clientY'])
    ctx.closePath()
    ctx.stroke();
  }

//clears canvas completely
  refresh = () => {
    const canvas = this.refs.canvas
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  brushChange = (input) => {
    switch(input){
      case 'pencil':
        return this.setState({radius: 2});
      case 'small':
        return this.setState({radius: 7});
      case 'medium':
        return this.setState({radius: 17});
      case 'large':
        return this.setState({radius: 27});
      case 'chunka':
        return this.setState({radius: 60})
    }
  }

  mouseDownFalse = () => {
    if(this.state.mouseDown){
      let newPreviousLines = [...this.state.previousLines, this.state.newestLines]
      this.setState({mouseDown: false, previousLines: newPreviousLines})
    }
  }

  undoLine = () => {
    //prevents entire project from being erased or undefined being passed into undoneLines array
    if(this.state.undraw && (this.state.previousLines.length > 0)){
      let lastItemidx = this.state.previousLines.length -1
      let minusLastLines = this.undoFilter(this.state.previousLines, lastItemidx)
      let lastLine = this.state.previousLines[lastItemidx]
      this.setState({previousLines: minusLastLines, undoneLines: [lastLine, ...this.state.undoneLines]})
      this.refresh()
      this.redrawAll(minusLastLines)
    }
  }

  redoLine = () => {
    if(this.state.redraw && (this.state.undoneLines.length > 0)){
      let minusFirstLine = this.state.undoneLines.filter(function(line, idx){
        return idx > 0
      })
      this.setState({undoneLines: minusFirstLine, previousLines: [...this.state.previousLines, this.state.undoneLines[0]]})
    }
  }

  undoFilter = (array, index) => {
    return array.filter(function(lines, idx){
      return idx < index
    })
  }

  undraw = () => {
    this.setState({undraw: true})
      setInterval(() => { this.undoLine()}, 120)
  }

  redraw = () => {
    this.setState({redraw: true})
    setInterval(() => {
      this.redoLine()
      this.redrawAll(this.state.previousLines)
    }, 120)
  }

  handleChangeComplete = (color) => {
    this.setState({color: color.hex})
  }

  downloadImage = () => {
    //grabs canvas using ID
    let canvas = this.refs.canvas
    canvas.href = canvas.toDataURL("image/png")
    this.setState({image: canvas.href})
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
  console.log(this.state.undoneLines)
    return (
      <div>
        <canvas
         ref="canvas"
         className={this.state.canvasName}
         width={900}
         height={424}
         onMouseDown={e=>this.onMouseDownHelper(e)}
         onMouseUp={()=>this.mouseDownFalse()}
         onMouseMove={e => this.mouseMoveHelper(e)}
         onMouseOut={() => this.mouseDownFalse()}
        /><br />
        <CompactPicker
          color={this.state.color}
          onChangeComplete={this.handleChangeComplete}
        />
        <button onClick={() => this.brushChange('pencil')}>pencil</button>
        <button onClick={() => this.brushChange('small')}>Small</button>
        <button onClick={() => this.brushChange('medium')}>Medium</button>
        <button onClick={() => this.brushChange('large')}>Large</button>
        <button onClick={() => this.brushChange('chunka')}>Chunka</button>
        <button onClick={() => this.downloadImage()}>download image</button>
        <button onClick={() => this.refresh()}>refresh</button>
        <button onMouseDown={() => this.redraw()} onMouseUp={() => this.setState({redraw: false})}>ReDraw</button>
        <button onMouseDown={() => this.undraw()} onMouseUp={() => this.setState({undraw: false})}>undraw</button>
        <input type="email" placeholder="email" onChange={event => this.setState({email: event.target.value})} />
        <a href="path-to-image.png" onClick={() => this.mailTo()} >
          <img src={this.state.image} />
        </a>
      </div>
    )
  }

}

export default Canvas;
