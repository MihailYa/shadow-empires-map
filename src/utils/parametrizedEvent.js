export class ParametrizedEvent {
  listeners = []
  addEventListener(listener) {
    this.listeners.push(listener)
  }
  removeEventListener(listener) {
    const index = this.listeners.findIndex(cur => cur === listener);
    this.listeners = this.listeners.splice(index, 1);
  }
  broadcast(params) {
    this.listeners.forEach(listener => listener(params))
  }
}