import { awaitPort } from "/js/common/await.js";
import IDManager     from "/js/common/id-manager.js";

import { galapagos, galaProto } from "/js/static/domain.js";

export default class NLWManager {

  #babyMonitor   = null;      // MessagePort
  #outerFrame    = undefined; // Element
  #resolverQueue = undefined; // Array[() => Unit]
  #withNLWID     = undefined; // (Object[Any]) => Object[Any]

  // (Element) => NLWManager
  constructor(outerFrame) {

    const idMan = new IDManager();

    this.#outerFrame    = outerFrame;
    this.#resolverQueue = [];
    this.#withNLWID     = (msg) => ({ ...msg, id: idMan.next(""), source: "hnw" });

  }

  // () => Unit
  hide = () => {
    this.#babyMonitor?.close();
    this.#babyMonitor = null;
    this.#outerFrame.classList.add("hidden");
    this.#resolverQueue = [];
    this._hide();
  };

  // () => Unit
  init = () => {};

  // () => Unit
  show = () => {
    this.#outerFrame.classList.remove("hidden");
    this._show();
  };

  // (String, Object[Any]?) => Promise[Any]
  _await = (type, msg = {}) => {
    const m = this.#withNLWID(msg);
    return this.#withBabyMonitor((bm) => awaitPort(bm)(type, m));
  };

  // (Object[Any]) => Unit
  _post = (msg) => {
    const m = this.#withNLWID(msg);
    this.#withBabyMonitor((bm) =>
      new Promise((resolve) => {
        bm.postMessage(m);
        resolve();
      })
    );
  };

  // ((MessagePort) => Promise[T]) => Promise[T]
  #withBabyMonitor = (f) => {
    if (this.#babyMonitor !== null) {
      return f(this.#babyMonitor);
    } else {
      return new Promise((resolve) => {
        this.#resolverQueue.push(resolve);
      }).then(
        () => f(this.#babyMonitor)
      );
    }
  };

  // () => String
  _galaURL = `${galaProto}://${galapagos}`;

  // () => HTMLIFrameElement
  _getFrame = () => {
    return this.#outerFrame.querySelector("iframe");
  };

  // () => Unit
  _hide = () => {};

  // (Object[Any]) => Unit
  _onBabyMonitorMessage = () => {};

  // (MessagePort) => Unit
  _setBabyMonitor = (bm) => {

    this.#babyMonitor = bm;
    this.#resolverQueue.forEach((f) => f());
    this.#resolverQueue = [];

    bm.onmessage = this._onBabyMonitorMessage;

  };

  // () => Unit
  _show = () => {};

}
