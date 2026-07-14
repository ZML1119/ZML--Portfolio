(function () {
  class LiquidEtherHero {
    constructor(container) {
      this.container = container;
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d", { alpha: true });
      this.pointer = { x: 0.5, y: 0.48 };
      this.target = { x: 0.5, y: 0.48 };
      this.last = { x: 0.5, y: 0.48 };
      this.velocity = { x: 0, y: 0 };
      this.autoAngle = Math.random() * Math.PI * 2;
      this.lastInteraction = 0;
      this.raf = null;
      this.resizeRaf = null;
      this.time = 0;
      this.colors = this.readColors();
      this.particles = this.createParticles(18);
      this.init();
    }

    readColors() {
      const raw = this.container.dataset.colors || "#3B82F6,#06B6D4,#c2edf5";
      const colors = raw.split(",").map((item) => item.trim()).filter(Boolean);
      return {
        blue: colors[0] || "#3B82F6",
        cyan: colors[1] || "#06B6D4",
        ice: colors[2] || "#c2edf5"
      };
    }

    init() {
      this.canvas.setAttribute("aria-hidden", "true");
      this.container.prepend(this.canvas);
      this.onPointerMove = this.onPointerMove.bind(this);
      this.onResize = this.onResize.bind(this);
      window.addEventListener("pointermove", this.onPointerMove);
      window.addEventListener("resize", this.onResize);
      this.onResize();
      this.tick();
    }

    onResize() {
      if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
      this.resizeRaf = requestAnimationFrame(() => {
        this.rect = this.container.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        const width = Math.max(1, Math.floor(this.rect.width));
        const height = Math.max(1, Math.floor(this.rect.height));
        this.canvas.width = Math.floor(width * ratio);
        this.canvas.height = Math.floor(height * ratio);
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        this.width = width;
        this.height = height;
      });
    }

    createParticles(count) {
      return Array.from({ length: count }, (_, index) => ({
        x: Math.random(),
        y: 0.18 + Math.random() * 0.62,
        radius: 26 + Math.random() * 58,
        speedX: 0.00045 + Math.random() * 0.00135,
        speedY: (Math.random() - 0.5) * 0.00055,
        phase: Math.random() * Math.PI * 2,
        wobble: 0.55 + Math.random() * 1.45,
        alpha: 0.018 + Math.random() * 0.052,
        color: index % 3 === 0 ? this.colors.cyan : index % 3 === 1 ? this.colors.blue : this.colors.ice
      }));
    }

    onPointerMove(event) {
      const rect = this.rect || this.container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        return;
      }
      this.target.x = (event.clientX - rect.left) / rect.width;
      this.target.y = (event.clientY - rect.top) / rect.height;
      this.container.style.setProperty("--liquid-x", `${(this.target.x * 100).toFixed(2)}%`);
      this.container.style.setProperty("--liquid-y", `${(this.target.y * 100).toFixed(2)}%`);
      this.lastInteraction = performance.now();
    }

    updateAuto() {
      const idle = performance.now() - this.lastInteraction;
      if (idle < 1600) return;
      this.autoAngle += 0.012;
      this.target.x = 0.5 + Math.cos(this.autoAngle * 1.2) * 0.22;
      this.target.y = 0.48 + Math.sin(this.autoAngle * 0.9) * 0.12;
      this.container.style.setProperty("--liquid-x", `${(this.target.x * 100).toFixed(2)}%`);
      this.container.style.setProperty("--liquid-y", `${(this.target.y * 100).toFixed(2)}%`);
    }

    drawBlob(x, y, radius, color, alpha) {
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(x, y);
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      gradient.addColorStop(0, `${color}${alpha}`);
      gradient.addColorStop(0.38, `${color}${Math.round(Number.parseInt(alpha, 16) * 0.72).toString(16).padStart(2, "0")}`);
      gradient.addColorStop(1, `${color}00`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawParticle(particle, index) {
      const ctx = this.ctx;
      const wobbleX = Math.cos(this.time * particle.wobble + particle.phase) * 0.028;
      const wobbleY = Math.sin(this.time * (particle.wobble * 0.8) + particle.phase) * 0.022;
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      if (particle.x < -0.08) particle.x = 1.08;
      if (particle.x > 1.08) particle.x = -0.08;
      if (particle.y < 0.12) particle.y = 0.84;
      if (particle.y > 0.88) particle.y = 0.16;

      const x = (particle.x + wobbleX) * this.width;
      const y = (particle.y + wobbleY) * this.height;
      const pulse = 0.72 + Math.sin(this.time * 0.9 + particle.phase) * 0.28;
      const radius = particle.radius * pulse;
      const alpha = Math.round(255 * particle.alpha).toString(16).padStart(2, "0");

      ctx.save();
      ctx.translate(x, y);
      ctx.filter = "blur(18px)";
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      gradient.addColorStop(0, `${particle.color}${alpha}`);
      gradient.addColorStop(0.32, `${particle.color}${Math.round(Number.parseInt(alpha, 16) * 0.58).toString(16).padStart(2, "0")}`);
      gradient.addColorStop(1, `${particle.color}00`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    tick() {
      this.updateAuto();
      this.pointer.x += (this.target.x - this.pointer.x) * 0.16;
      this.pointer.y += (this.target.y - this.pointer.y) * 0.16;
      this.velocity.x = this.pointer.x - this.last.x;
      this.velocity.y = this.pointer.y - this.last.y;
      this.last.x = this.pointer.x;
      this.last.y = this.pointer.y;

      if (!this.width || !this.height) {
        this.raf = requestAnimationFrame(() => this.tick());
        return;
      }

      this.time += 0.032;
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      const px = this.pointer.x * w;
      const py = this.pointer.y * h;
      const speed = Math.min(1, Math.hypot(this.velocity.x, this.velocity.y) * 110);
      const angle = Math.atan2(this.velocity.y, this.velocity.x || 0.001);
      const isUserActive = performance.now() - this.lastInteraction < 900;
      const activeBoost = isUserActive ? 1 : 0;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      this.particles.forEach((particle, index) => this.drawParticle(particle, index));

      ctx.filter = "blur(18px)";
      this.drawBlob(px, py, 110 + speed * 145 + activeBoost * 52, this.colors.cyan, "a8");
      this.drawBlob(px - w * 0.035, py + h * 0.025, 74 + speed * 72 + activeBoost * 32, this.colors.ice, "72");
      this.drawBlob(px + w * 0.045, py - h * 0.03, 118 + speed * 92 + activeBoost * 42, this.colors.blue, "98");
      this.drawBlob(px - this.velocity.x * w * 6, py - this.velocity.y * h * 6, 84 + speed * 110 + activeBoost * 38, this.colors.blue, "82");
      ctx.filter = "none";

      const highlight = ctx.createRadialGradient(px, py, 0, px, py, 190 + speed * 160 + activeBoost * 70);
      highlight.addColorStop(0, `rgba(255, 255, 255, ${0.22 + speed * 0.18})`);
      highlight.addColorStop(0.18, "rgba(194, 237, 245, 0.28)");
      highlight.addColorStop(0.42, "rgba(35, 216, 255, 0.2)");
      highlight.addColorStop(0.72, "rgba(82, 39, 255, 0.12)");
      highlight.addColorStop(1, "rgba(6, 182, 212, 0)");
      ctx.fillStyle = highlight;
      ctx.fillRect(0, 0, w, h);

      this.raf = requestAnimationFrame(() => this.tick());
    }

    dispose() {
      if (this.raf) cancelAnimationFrame(this.raf);
      if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
      window.removeEventListener("pointermove", this.onPointerMove);
      window.removeEventListener("resize", this.onResize);
      this.canvas.remove();
    }
  }

  document.querySelectorAll(".liquid-ether-container").forEach((container) => {
    new LiquidEtherHero(container);
  });
})();
