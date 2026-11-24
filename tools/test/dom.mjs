// The DOM shim for the vanilla tests: a fresh happy-dom window per call.
import { Window } from "happy-dom";

export function dom(html = "") {
  const window = new Window({ url: "http://localhost/" });
  const document = window.document;
  document.body.innerHTML = html;
  const $ = (sel) => document.querySelector(sel);
  const key = (target, k, init = {}) => {
    const e = new window.KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true, ...init });
    target.dispatchEvent(e);
    return e;
  };
  const click = (target) => target.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  const pointerdown = (target) => target.dispatchEvent(new window.Event("pointerdown", { bubbles: true }));
  return { window, document, $, key, click, pointerdown, close: () => window.happyDOM.close() };
}
