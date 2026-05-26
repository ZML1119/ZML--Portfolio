const root = document.documentElement;
const revealItems = document.querySelectorAll(".reveal");
const tiltCards = document.querySelectorAll(".tilt-card");
const filterButtons = document.querySelectorAll(".filter");
const projectCards = document.querySelectorAll(".project-card");
const dialog = document.querySelector(".case-dialog");
const dialogImage = dialog?.querySelector("img");
const closeDialog = dialog?.querySelector(".dialog-close");
const titleText = document.querySelector(".hero-title__text");
const titleCursor = document.querySelector(".hero-title__cursor");
const heroSection = document.querySelector(".hero");

window.addEventListener("pointermove", (event) => {
  root.style.setProperty("--x", `${event.clientX}px`);
  root.style.setProperty("--y", `${event.clientY}px`);
  if (!heroSection) return;
  const rect = heroSection.getBoundingClientRect();
  const isInsideHero =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;
  document.body.classList.toggle("is-hero-pointer", isInsideHero);
});

const runTitleType = () => {
  if (!titleText) return;
  const text = titleText.dataset.textType || titleText.textContent || "";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    titleText.textContent = text;
    if (titleCursor) titleCursor.style.display = "none";
    return;
  }

  titleText.textContent = "";
  let index = 0;
  const speed = 120;

  const tick = () => {
    titleText.textContent = text.slice(0, index);
    index += 1;
    if (index <= text.length) {
      window.setTimeout(tick, speed);
    }
  };

  window.setTimeout(tick, 220);
};

runTitleType();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

tiltCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -6;
    const rotateY = ((x / rect.width) - 0.5) * 6;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const kx = dx === 0 ? Infinity : centerX / Math.abs(dx);
    const ky = dy === 0 ? Infinity : centerY / Math.abs(dy);
    const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    card.style.setProperty("--edge-proximity", `${(edge * 100).toFixed(3)}`);
    card.style.setProperty("--cursor-angle", `${angle.toFixed(3)}deg`);
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--edge-proximity", "0");
    card.style.transform = "";
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    projectCards.forEach((card) => {
      const categories = card.dataset.category?.split(" ") || [];
      const isVisible = filter === "all" || categories.includes(filter);
      card.style.transform = "";
      card.style.setProperty("--edge-proximity", "0");
      card.classList.toggle("is-hidden", !isVisible);
    });
  });
});

projectCards.forEach((card) => {
  card.addEventListener("click", () => {
    if (!dialog || !dialogImage) return;
    dialogImage.src = card.dataset.image;
    dialogImage.alt = `${card.querySelector("h3")?.textContent || "案例"}完整长图`;
    dialog.showModal();
    dialog.scrollTop = 0;
  });
});

closeDialog?.addEventListener("click", () => {
  dialog?.close();
});

dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) {
    dialog.close();
  }
});
