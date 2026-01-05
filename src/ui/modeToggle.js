import { inputState } from "../player/inputState.js";
export function enableAuthorMode() {
  inputState.authorMode = true;
  inputState.movementEnabled = false;
  inputState.lookEnabled = false;
  document.exitPointerLock?.();
  document.body.classList.add("author-mode");
}
export function enablePlayerMode(canvas) {
  inputState.authorMode = false;
  inputState.movementEnabled = true;
  inputState.lookEnabled = true;
  canvas.requestPointerLock?.();
  document.body.classList.remove("author-mode");
}
export function toggleMode(canvas) {
  if (inputState.authorMode) {
    enablePlayerMode(canvas);
  } else {
    enableAuthorMode();
  }
}
