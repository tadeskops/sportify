import { icon } from "./dom.js";

export function mountBackToTop() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "back-to-top";
  button.setAttribute("aria-label", "Back to top");
  button.title = "Back to top";
  button.innerHTML = icon("up");
  const update = () => { button.hidden = window.scrollY <= 400; };
  update();
  document.body.append(button);
  window.addEventListener("scroll", update, { passive: true });
  button.addEventListener("click", () => {
    document.getElementById("page-title").focus({ preventScroll: true });
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
    });
  });
}
