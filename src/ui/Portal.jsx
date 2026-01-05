import { createPortal } from "react-dom";
export default function Portal({ children }) {
  const el = document.getElementById("ui-root");
  if (!el) return null;
  return createPortal(children, el);
}
