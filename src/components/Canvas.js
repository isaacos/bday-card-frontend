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
    redraw: true,
    setting: 'paint'
  }

  mouseMoveHelper = (event) => {
    if(this.state.setting !== 'bigLine'){
        this.setState({startX: event.clientX, startY: event.clientY})
        if(this.state.mouseDown){
            this.drawLine(event)
        }
    }
    //draws bigLine on page after mouseDown
    if(this.state.setting === 'bigLine' && this.state.mouseDown){
      //refreshes page but does not commit line to previous Lines, to prevents lines appearing with every motion
      this.refresh()
      this.redrawAll(this.state.previousLines)
      this.drawLine(event, 0, 'dont commit')
    }
  }



  onMouseDownHelper = (event) => {
    if(this.state.setting === 'bigLine'){
      this.setState({startX: event.clientX, startY: event.clientY, mouseDown: true})
    } else {
      this.setState({mouseDown: true})
      this.drawLine(event, 1)
    }
  }

  drawLine = (event, minusClientX =0, commit = 'commit') => {
    const offsetLeft = this.refs.canvas.offsetLeft
    let storedLine = {startX: this.state.startX - offsetLeft, startY: this.state.startY, clientX:  event.clientX - minusClientX - offsetLeft, clientY: event.clientY, color: this.state.color, radius: this.state.radius, setting: this.state.setting}
    this.drawHelper(storedLine)
    //commits new lines to previousLines except for mouseMove helper for bigLines
    if(commit === 'commit'){
      let newLines =  [...this.state.previousLines, storedLine]
      this.setState({previousLines: newLines})
    }
  }

  redrawAll = (prevLines) => {
    prevLines.forEach(lineObj =>{
      this.drawHelper(lineObj)
    })
  }

  drawHelper = (lineObj) => {
    const canvas = this.refs.canvas
    const ctx = canvas.getContext('2d')
    if(lineObj['setting'] === 'paint' || lineObj['setting'] === 'bigLine'){
      this.paintSettingDraw(ctx, lineObj)
    }
    if(lineObj['setting'] === 'square'){
      this.squareSettingDraw(ctx, lineObj)
    }
  }

//determines lineJoin based on the paint setting
  setLineJoin = (setting) => {
    switch(setting){
      case 'paint':
        return 'round'
      case 'bigLine':
        return 'miter'
      case 'square':
        return 'bevel'
    }
  }

  paintSettingDraw = (ctx, lineObj) => {
    ctx.strokeStyle = lineObj['color'];
    ctx.beginPath();
    ctx.lineWidth = lineObj['radius']
    ctx.lineJoin = this.setLineJoin(lineObj['setting'])
    ctx.moveTo(lineObj['startX'], lineObj['startY'])
    ctx.lineTo(lineObj['clientX'], lineObj['clientY'])
    ctx.closePath()
    ctx.stroke();
  }

  squareSettingDraw = (ctx, lineObj) => {
    ctx.lineJoin = this.setLineJoin(lineObj['setting'])
    ctx.fillStyle = lineObj['color']
    //set cursor in the middle fo the square
    const startX =lineObj['startX'] - (lineObj['radius'] / 2)
    const startY = lineObj['startY'] - (lineObj['radius'] / 2)
    ctx.fillRect(startX, startY, lineObj['radius'], lineObj['radius'])
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
        return this.setState({radius: 100})
    }
  }

  mouseUpOrOutHelper = (event) => {
    if(this.state.mouseDown){
      let newPreviousLines = [...this.state.previousLines, this.state.newestLines]
      this.setState({mouseDown: false, previousLines: newPreviousLines})
      //commits the bigLine onMouseUp 
      if(this.state.setting === 'bigLine'){
        this.refresh()
         this.redrawAll(this.state.previousLines)
         this.drawLine(event, 0)
      }
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
    return (
      <div>
        <canvas
         ref="canvas"
         className={this.state.canvasName}
         width={900}
         height={424}
         onMouseDown={e=>this.onMouseDownHelper(e)}
         onMouseUp={e =>this.mouseUpOrOutHelper(e)}
         onMouseMove={e => this.mouseMoveHelper(e)}
         onMouseOut={e => this.mouseUpOrOutHelper(e)}
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
        <button onClick={() => this.setState({setting: 'paint'})}>paint</button>
        <button onClick={() => this.setState({setting: 'square'})}>Square</button>
        <button onClick={() => this.setState({setting: 'bigLine'})}>Big Line</button>
        <button onClick={() => this.refresh()} onMouseDown={() => this.setState({previousLines: [], undoneLines: []})}>refresh</button>
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
