import { ViewUtil } from "./util/ViewUtil";
export class MainView {
  constructor() {}
  build() {
    const frame = ViewUtil.add(null, "div", {}, { margin: "10px" });
    ViewUtil.add(frame, "h1", { text: "Yadorigi" });

    const body = document.getElementsByTagName("body")[0];
    body.appendChild(frame);
  }
}
