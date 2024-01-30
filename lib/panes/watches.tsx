import { CompositeDisposable } from "atom";
import React from "react";
import { reactFactory, WATCHES_URI } from "../utils";
type store = typeof import("../store").default;
import Watches from "../components/watch-sidebar";
export default class WatchesPane {
  element = document.createElement("div");
  disposer = new CompositeDisposable();

  constructor(store: store) {
    this.element.classList.add("hydron");
    reactFactory(<Watches store={store} />, this.element, null, this.disposer);
  }

  getTitle = () => "Hydron Watch";
  getURI = () => WATCHES_URI;
  getDefaultLocation = () => "right";
  getAllowedLocations = () => ["left", "right"];

  destroy() {
    this.disposer.dispose();
    this.element.remove();
  }
}
