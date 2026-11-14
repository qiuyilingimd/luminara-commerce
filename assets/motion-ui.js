import { animate, stagger } from "../vendor/motion.esm.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer:fine)").matches;

function animateFiltered(items) {
  if (reduceMotion || !items.length) return;

  items.forEach((item) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(14px) scale(.988)";
  });

  animate(
    items,
    {
      opacity: [0, 1],
      y: [14, 0],
      scale: [0.988, 1]
    },
    {
      duration: 0.52,
      delay: stagger(0.035),
      ease: [0.22, 1, 0.36, 1]
    }
  );
}

function animateDrawer(drawer) {
  if (reduceMotion || !drawer) return;

  requestAnimationFrame(() => {
    const drawerBody = drawer.querySelector("#drawerBody");
    const blocks = drawerBody ? [...drawerBody.children] : [...drawer.children];
    if (!blocks.length) return;

    animate(
      blocks,
      {
        opacity: [0.55, 1],
        y: [12, 0]
      },
      {
        duration: 0.46,
        delay: stagger(0.025),
        ease: [0.22, 1, 0.36, 1]
      }
    );
  });
}

if (!reduceMotion && finePointer) {
  document.querySelectorAll(".vitem").forEach((card) => {
    const image = card.querySelector(".v-plate img");
    if (!image) return;

    card.addEventListener(
      "pointerenter",
      (event) => {
        if (event.pointerType === "touch") return;
        animate(
          image,
          { scale: 1.032, y: -3 },
          {
            type: "spring",
            stiffness: 285,
            damping: 29,
            mass: 0.58
          }
        );
      },
      { passive: true }
    );

    card.addEventListener(
      "pointerleave",
      () => {
        animate(
          image,
          { scale: 1, y: 0 },
          {
            type: "spring",
            stiffness: 260,
            damping: 30,
            mass: 0.6
          }
        );
      },
      { passive: true }
    );
  });

}

if (!reduceMotion) {
  document.querySelectorAll(".filter-chip").forEach((button) => {
    const settle = () =>
      animate(
        button,
        { scale: 1 },
        {
          type: "spring",
          stiffness: 380,
          damping: 27,
          mass: 0.5
        }
      );

    button.addEventListener(
      "pointerdown",
      () =>
        animate(
          button,
          { scale: 0.965 },
          { duration: 0.12, ease: "easeOut" }
        ),
      { passive: true }
    );
    button.addEventListener("pointerup", settle, { passive: true });
    button.addEventListener("pointercancel", settle, { passive: true });
    button.addEventListener("pointerleave", settle, { passive: true });
  });
}

window.LuminaraMotion = {
  animateFiltered,
  animateDrawer,
  version: "14.14.0"
};
