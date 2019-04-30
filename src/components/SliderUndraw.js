import React, { Component } from 'react';
import { CompactPicker } from 'react-color';

import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css'

function SliderUndraw(props){

  function handleOnChange (newValue)  {
    if(newValue > 0){
      (() => {
        props.undoLine()
      })(newValue - 0)
    }
    if(newValue < 0){
      (() => {
        props.redoLine()
      })(0 - newValue)
    }
  }

  return <Slider
    tooltip={false}
    value={0}
    onChange={handleOnChange}
    min={ props.min}
    max={props.max === 0 ? 1 : props.max}
  />
}
export default SliderUndraw;
