import React, { Component } from 'react';

function Modal(props){



  return <div className={(props.image === '') ? "display-none" : "modal display-block"}>
    <section className="modal-main">
    <h3>Picture sent to {props.email}</h3>
    <img src={props.image} />
    <button onClick={props.closeModal}>Close</button>
    </section>
  </div>
}

export default Modal;
