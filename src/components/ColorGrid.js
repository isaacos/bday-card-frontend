import React from 'react';

const ColorGrid = ({setColor}) => {

  const colors = ['#F44E3B', '#D33115', '#9F0500', '#FE9200', '#E27300', '#C45100', '#FCDC00', '#FCC400', '#FB9E00', '#DBDF00', '#B0BC00', '#808900', '#A4DD00', '#68BC00', '#194D33', '#68CCCA', '#16A5A5', '#0C797D', '#73D8FF', '#009CE0', '#0062B1', '#AEA1FF', '#7B64FF', '#653294', '#FDA1FF', '#FA28FF', '#AB149E','#4D4D4D', '#333333', '#000000', '#999999', '#808080', '#666666', '#FFFFFF', '#CCCCCC', '#B3B3B3']

  return (
    <ul>
    {colors.map(color => <li onClick={e => setColor(e)} key={color} id={color} style={{background: color}}></li>)}
    </ul>
  )
}

export default ColorGrid;
