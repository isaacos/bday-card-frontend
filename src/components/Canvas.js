import React, { Component } from 'react';

import ColorGrid from './ColorGrid.js';

import SliderUndraw from './SliderUndraw.js';
import Modal from './Modal.js';
import 'react-rangeslider/lib/index.css'


class Canvas extends Component {

  state = {
    radius: 2,
    mouseDown: false,
    color: '#000000',
    image: '',
    email: '',
    startX: null,
    startY: null,
    newestLines: [],
    previousLines: [],
    undoneLines: [],
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
      this.setState({startX: event.clientX, startY: event.clientY, mouseDown: true, undoneLines: []})
    } else {
      this.setState({mouseDown: true, undoneLines: []})
      this.drawLine(event, 1)
    }
  }

  drawLine = (event, minusClientX =0, commit = 'commit') => {
    const offsetLeft = this.refs.canvas.offsetLeft
    const offsetTop = this.refs.canvas.offsetTop
    let storedLine = {startX: this.state.startX - offsetLeft, startY: this.state.startY - offsetTop, clientX:  event.clientX - minusClientX - offsetLeft, clientY: event.clientY - offsetTop, color: this.state.color, radius: this.state.radius, setting: this.state.setting}
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

  brushChange = (event) => {
    let input = event.target.id
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
      default:
        return this.setState({radius: 2})
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
    if(this.state.previousLines.length > 0){
      let lastItemidx = this.state.previousLines.length -1
      let minusLastLines = this.undoFilter(this.state.previousLines, lastItemidx)
      let lastLine = this.state.previousLines[lastItemidx]
      this.setState({previousLines: minusLastLines, undoneLines: [lastLine, ...this.state.undoneLines]})
      this.refresh()
      this.redrawAll(minusLastLines)
    }
  }

  redoLine = () => {
    if( this.state.undoneLines.length > 0){
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

  downloadImage = () => {
    //grabs canvas using ID
    let canvas = this.refs.canvas
    canvas.href = canvas.toDataURL("image/png")
    this.setState({image: canvas.href})
  }

  mailTo = () => {
    fetch('https://bday-backend.herokuapp.com/mail', {
      mode: 'no-cors',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: this.state.email,
        url: this.refs.canvas.toDataURL("image/png")
      })
    }).then(response => response.json())
    .then(response => this.postMailHandler(response))
  }

  postMailHandler = (response) => {
    this.setState({image: response.url})
  }

  closeModal = () => {
    this.setState({image: ''})
  }

  setButtonStyle = (variable) => {
    if (variable === this.state.radius || variable === this.state.setting){
        //includes ternary to factor in visability in case the color is black
      return ['#4d4d4d', '#333333', '#000000'].includes(this.state.color) ? {background: this.state.color, color: 'white', borderColor: 'black'} : {background: this.state.color}
    } else {
      return {}
    }
  }

  setColor = (event) => {
    this.setState({color: event.target.id})
  }

  render () {
    return (
      <div>
        <div className="canvas-row-container">
          <div className="canvas-left">
          <div className="sizing-buttons">
            <button style={this.setButtonStyle(2)} id="pencil" className="size-btn" onClick={e => this.brushChange(e)}>pencil</button>
            <button style={this.setButtonStyle(7)} id="small" className="size-btn" onClick={e => this.brushChange(e)}>Small</button>
            <button style={this.setButtonStyle(17)}id="medium" className="size-btn" onClick={e => this.brushChange(e)}>Medium</button>
            <button style={this.setButtonStyle(27)}id="large" className="size-btn" onClick={e => this.brushChange(e)}>Large</button>
            <button style={this.setButtonStyle(100)}id="chunka" className="size-btn" onClick={e => this.brushChange(e)}>Chunka</button>
          </div>
          <div className="setting-buttons">
            <button style={this.setButtonStyle('paint')} onClick={() => this.setState({setting: 'paint'})}>paint</button>
            <button style={this.setButtonStyle('square')} onClick={() => this.setState({setting: 'square'})}>Square</button>
            <button style={this.setButtonStyle('bigLine')} onClick={() => this.setState({setting: 'bigLine'})}>Big Line</button>
          </div>

          <button className="refresh-mail-btn" onClick={() => this.refresh()} onMouseDown={() => this.setState({previousLines: [], undoneLines: []})}>refresh</button>
          <input type="email" placeholder="Email" onChange={event => this.setState({email: event.target.value})} />
          <button className="refresh-mail-btn" onClick={() => this.mailTo()}> MAIL </button>
          <ColorGrid setColor={this.setColor}/>
          </div>
            <canvas
            ref="canvas"
            className={this.state.canvasName}
            width={900}
            height={424}
            onMouseDown={e =>this.onMouseDownHelper(e)}
            onMouseUp={e =>this.mouseUpOrOutHelper(e)}
            onMouseMove={e => this.mouseMoveHelper(e)}
            onMouseOut={e => this.mouseUpOrOutHelper(e)}
            /><br />
          </div>
          <div>
            <div className="slider-container">
              <div className="slider-right">
              </div>
              <SliderUndraw
                undoLine={this.undoLine}
                redoLine={this.redoLine}
                min={-this.state.undoneLines.length * 2}
                max={this.state.previousLines.length * 1.7}
              />
            </div>
            <Modal
              email={this.state.email}
              image={this.state.image}
              closeModal={this.closeModal}
            />
          </div>
        <ul className="bottom-row">
         <li id="bottom-20">
         </li>
        </ul>

      </div>
    )
  }

}

export default Canvas;
