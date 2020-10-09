import React, { Component } from 'react';
import './FloatingWindow.sass';

export default class FloatingWindow extends Component {
  constructor(props) {
    super(props);
    const savedState = JSON.parse(localStorage.getItem(this.getKey("state"))) || {};
    this.state = Object.assign(savedState, {
      isDragging: false,
      mouseOffset: null,
      floatingWindowRef: React.createRef(),
    });
  }

  onMouseDown(event) {
    const newState = Object.assign({}, this.state);
    newState.isDragging = true;

    const floatingDiv = this.state.floatingWindowRef.current;
    const divRect = floatingDiv.getBoundingClientRect();
    newState.mouseOffset = {
      x: event.pageX - divRect.left,
      y: event.pageY - divRect.top,
    };

    this.setState(newState);
    document.body.style.cursor = 'move';
  }

  onMouseUp(event) {
    if (!this.state.isDragging)
      return;
    const newState = Object.assign({}, this.state);
    newState.isDragging = false;
    newState.mouseOffset = null;
    this.setState(newState);
    localStorage.setItem(this.getKey("state"), JSON.stringify({
      floatingWindowPosX: this.state.floatingWindowPosX,
      floatingWindowPosY: this.state.floatingWindowPosY
    }));
    document.body.style.cursor = 'auto';
  }

  onMouseMove(event) {
    if (!this.state.isDragging)
      return;
    this.setFloatingWindowPos(event.pageX - this.state.mouseOffset.x, event.pageY - this.state.mouseOffset.y);
    event.preventDefault();
  }

  setFloatingWindowPos(posX, posY) {
    const newState = Object.assign({}, this.state);
    newState.floatingWindowPosX = posX;
    newState.floatingWindowPosY = posY;
    this.setState(newState);
  }

  componentDidMount() {
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this))
  }

  getComponentId() {
    return this.props.componentId;
  }
  getKey(keyName) {
    return this.getComponentId() + "." + keyName;
  }

  render() {
    return <div className="floatingWindow" ref={this.state.floatingWindowRef}
                style={{left: this.state.floatingWindowPosX + 'px', top: this.state.floatingWindowPosY + 'px'}}>
      <div className="floatingWindowHandle" onMouseDown={this.onMouseDown.bind(this)}
           onMouseUp={this.onMouseUp.bind(this)} />
      <div className="floatingWindowContent">
        {this.props.children}
      </div>
    </div>;
  }
}