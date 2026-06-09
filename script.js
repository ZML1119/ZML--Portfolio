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
const chatbot = document.querySelector(".chatbot");
const chatbotToggle = document.querySelector(".chatbot-toggle");
const chatbotPanel = document.querySelector(".chatbot-panel");
const chatbotClose = document.querySelector(".chatbot-close");
const chatbotMessages = document.querySelector(".chatbot-messages");
const chatbotForm = document.querySelector(".chatbot-form");
const chatbotInput = document.querySelector(".chatbot-input");
const chatProxyMeta = document.querySelector('meta[name="chat-proxy-url"]');
const scrollProgress = document.querySelector(".scroll-progress span");
const siteHeader = document.querySelector(".site-header");
const navLinks = document.querySelectorAll(".nav-links a");
const pageSections = [...document.querySelectorAll("main section[id]")];
const magneticItems = document.querySelectorAll(".header-cta, .primary-btn, .ghost-btn, .filter");

const COZE_WORKFLOW_ID = "7611119380751450175";
const CHAT_PROXY_URL = chatProxyMeta?.content?.trim() || "";
const hasConfiguredChatProxy = CHAT_PROXY_URL && !CHAT_PROXY_URL.includes("YOUR-VERCEL-PROJECT");
let lastScrollY = window.scrollY;
let scrollSettleTimer = null;

if (heroSection) {
  const heroRect = heroSection.getBoundingClientRect();
  root.style.setProperty("--x", `${heroRect.left + heroRect.width / 2}px`);
  root.style.setProperty("--y", `${heroRect.top + heroRect.height / 2}px`);
}

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

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const updateScrollState = () => {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
  const velocity = clamp(window.scrollY - lastScrollY, -48, 48);
  lastScrollY = window.scrollY;
  root.style.setProperty("--scroll-progress", progress.toFixed(4));
  root.style.setProperty("--scroll-velocity", (velocity / 48).toFixed(3));
  root.style.setProperty("--scroll-drift-y", `${(velocity * 0.16).toFixed(1)}px`);
  root.style.setProperty("--scroll-drift-x", `${(velocity * -0.2).toFixed(1)}px`);
  root.style.setProperty("--scroll-drift-rev-x", `${(velocity * 0.18).toFixed(1)}px`);
  root.style.setProperty("--section-drift-y", `${(progress * -20).toFixed(1)}px`);
  root.style.setProperty("--section-drift-rev-y", `${(progress * 16).toFixed(1)}px`);
  document.body.classList.toggle("is-scrolled", window.scrollY > 34);
  document.body.classList.add("is-scrolling");

  window.clearTimeout(scrollSettleTimer);
  scrollSettleTimer = window.setTimeout(() => {
    document.body.classList.remove("is-scrolling");
    root.style.setProperty("--scroll-velocity", "0");
    root.style.setProperty("--scroll-drift-y", "0px");
    root.style.setProperty("--scroll-drift-x", "0px");
    root.style.setProperty("--scroll-drift-rev-x", "0px");
  }, 140);

  if (heroSection) {
    const heroRect = heroSection.getBoundingClientRect();
    const heroProgress = Math.min(1, Math.max(0, -heroRect.top / Math.max(1, heroRect.height)));
    root.style.setProperty("--hero-copy-shift", `${(heroProgress * -34).toFixed(1)}px`);
  }

  let activeId = "";
  pageSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 140 && rect.bottom >= 140) activeId = section.id;
  });
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
  });

  if (siteHeader) {
    const heroBottom = heroSection?.getBoundingClientRect().bottom || 0;
    root.style.setProperty("--header-lift", heroBottom < 80 ? "-2px" : "0");
  }

};

updateScrollState();
window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", updateScrollState);

const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

const smoothScrollTo = (targetY, duration = 900) => {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const start = performance.now();

  const step = (now) => {
    const elapsed = now - start;
    const progress = clamp(elapsed / duration, 0, 1);
    window.scrollTo(0, startY + distance * easeOutQuart(progress));
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
};

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    const headerOffset = siteHeader ? siteHeader.getBoundingClientRect().height + 18 : 0;
    const targetY = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    smoothScrollTo(Math.max(0, targetY));
    history.pushState(null, "", href);
  });
});

magneticItems.forEach((item) => {
  item.addEventListener("pointermove", (event) => {
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    item.style.setProperty("--magnet-x", `${clamp(x * 0.16, -9, 9).toFixed(1)}px`);
    item.style.setProperty("--magnet-y", `${clamp(y * 0.22, -8, 8).toFixed(1)}px`);
  });

  item.addEventListener("pointerleave", () => {
    item.style.setProperty("--magnet-x", "0px");
    item.style.setProperty("--magnet-y", "0px");
  });
});

heroSection?.addEventListener("pointerenter", () => {
  document.body.classList.add("is-hero-pointer");
});

heroSection?.addEventListener("pointerleave", () => {
  document.body.classList.remove("is-hero-pointer");
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
  });

  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--edge-proximity", "0");
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
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
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

const addChatMessage = (role, text) => {
  if (!chatbotMessages) return;
  const item = document.createElement("div");
  item.className = `chat-msg ${role}`;
  item.textContent = text;
  chatbotMessages.appendChild(item);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
};

const purgeLegacyChatWarnings = () => {
  if (!chatbotMessages) return;
  chatbotMessages.querySelectorAll(".chat-msg").forEach((item) => {
    if (/客服接口尚未配置|Vercel 地址|Coze Token|配置 Token/.test(item.textContent || "")) {
      item.remove();
    }
  });
};

const readBotReply = (json) => {
  if (!json || typeof json !== "object") return "";
  if (typeof json.output === "string") return json.output;
  if (typeof json.data === "string") return json.data;
  if (json.data && typeof json.data.output === "string") return json.data.output;
  if (Array.isArray(json.messages)) {
    const botMsg = json.messages.find((msg) => msg.role === "assistant" || msg.type === "answer");
    if (botMsg?.content) return String(botMsg.content);
  }
  if (Array.isArray(json.additional_messages)) {
    const botMsg = json.additional_messages.find((msg) => msg.role === "assistant");
    if (botMsg?.content) return String(botMsg.content);
  }
  return "";
};

const getLocalPortfolioReply = (question) => {
  const text = question.toLowerCase();
  const normalized = question.replace(/\s/g, "");

  if (/联系|电话|手机|微信|邮箱|mail|email|contact/.test(normalized)) {
    return "可以通过手机/微信 15121014943 或邮箱 627051691@qq.com 联系郑美龄，目前现居上海。";
  }

  if (/项目|作品|案例|portfolio|work/.test(normalized)) {
    return "作品集包含 i管家、IOC 智能运营数据可视化大屏、组件系统搭建、组件库应用-后台系统、AI 工具赋能设计、TRUE 大会主视觉、碳博会主视觉、光储热柔、京东首页 8.0、哈啰购卡改版和成长会员等项目。重点覆盖 B 端系统、组件库、AI 设计工具、活动视觉和 App 体验。";
  }

  if (/组件|设计系统|规范|component|system/.test(normalized)) {
    return "她主导过 200+ 组件规范沉淀和组件库搭建，覆盖数据可视化、后台管理、App 与 PC 多端组件，目标是提升多端一致性、研发协作效率和复杂业务的设计落地质量。";
  }

  if (/ai|智能|agent|机器人|工具/.test(text) || /人工智能|问答/.test(normalized)) {
    return "她在作品集中沉淀了 AI 图像、AI 组件、Agent 问答机器人等设计生产力应用场景，也做过 AI 辅助视觉探索和产品流程提效。";
  }

  if (/经历|经验|背景|简历|介绍|自己|是谁|resume|about/.test(normalized)) {
    return "郑美龄是高级 UI/UX 设计师、设计专家、体验设计负责人，拥有 10 年产品设计经验。她擅长从业务梳理、体验策略、视觉系统到落地推进，服务过美的楼宇科技、哈啰出行和京东等业务场景。";
  }

  if (/优势|擅长|能力|skill|强项/.test(normalized)) {
    return "她的核心优势是复杂 B 端业务体验设计、组件库与设计体系搭建、数据可视化、跨端一致性、AI 辅助设计探索，以及多项目团队协作和交付推进。";
  }

  return "你好，我是郑美龄作品集助手。你可以问我：她是谁、有哪些项目、擅长什么、组件库经验、AI 设计探索，或如何联系她。";
};

chatbotToggle?.addEventListener("click", () => {
  if (!chatbotPanel) return;
  const isOpen = !chatbotPanel.hasAttribute("hidden");
  if (isOpen) {
    chatbotPanel.setAttribute("hidden", "");
    chatbotToggle.setAttribute("aria-expanded", "false");
  } else {
    chatbotPanel.removeAttribute("hidden");
    chatbotToggle.setAttribute("aria-expanded", "true");
    purgeLegacyChatWarnings();
    if (chatbotMessages && chatbotMessages.children.length === 0) {
      addChatMessage("bot", "你好，我是郑美龄作品集助手。你可以问我她的项目、优势、经历或联系方式。");
    }
    chatbotInput?.focus();
  }
});

chatbotClose?.addEventListener("click", () => {
  chatbotPanel?.setAttribute("hidden", "");
  chatbotToggle?.setAttribute("aria-expanded", "false");
});

chatbotForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  purgeLegacyChatWarnings();
  const question = chatbotInput?.value?.trim();
  if (!question) return;

  addChatMessage("user", question);
  if (chatbotInput) chatbotInput.value = "";

  if (!hasConfiguredChatProxy) {
    window.setTimeout(() => {
      addChatMessage("bot", getLocalPortfolioReply(question));
    }, 180);
    return;
  }

  addChatMessage("bot", "正在思考中…");

  try {
    const response = await fetch(CHAT_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        workflow_id: COZE_WORKFLOW_ID,
        question
      })
    });

    const json = await response.json().catch(() => ({}));
    chatbotMessages?.lastElementChild?.remove();

    if (!response.ok) {
      addChatMessage("bot", `请求失败：${response.status} ${json?.msg || json?.message || "请检查 Token 或权限"}`);
      return;
    }

    const answer = readBotReply(json) || "机器人暂时没有返回内容。";
    addChatMessage("bot", answer);
  } catch (error) {
    chatbotMessages?.lastElementChild?.remove();
    addChatMessage("bot", `网络异常：${error?.message || "请稍后重试"}`);
  }
});
