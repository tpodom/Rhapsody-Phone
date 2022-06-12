import ResizeObserver from "resize-observer-polyfill";
global.ResizeObserver = ResizeObserver;
global.CSS = { supports: () => false };
