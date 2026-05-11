const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      obs.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);

revealElements.forEach((el) => observer.observe(el));

const year = document.getElementById("year");
if (year) {
  year.textContent = String(new Date().getFullYear());
}

const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");

if (burger && mobileMenu) {
  burger.addEventListener("click", () => {
    const expanded = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!expanded));
    burger.classList.toggle("is-active");
    mobileMenu.classList.toggle("is-open");
    document.body.classList.toggle("menu-open");
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      burger.setAttribute("aria-expanded", "false");
      burger.classList.remove("is-active");
      mobileMenu.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    });
  });
}

const cursorGlow = document.querySelector(".cursor-glow");
const parallaxItems = document.querySelectorAll("[data-parallax]");
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let frameId = null;

function renderParallax() {
  parallaxItems.forEach((item) => {
    const speed = Number(item.getAttribute("data-parallax")) || 0;
    const x = (mouseX - window.innerWidth / 2) * speed;
    const y = (mouseY - window.innerHeight / 2) * speed;
    item.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
  frameId = null;
}

function onPointerMove(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;

  if (cursorGlow) {
    cursorGlow.style.opacity = "1";
    const size = cursorGlow.offsetWidth || 260;
    cursorGlow.style.transform = `translate3d(${mouseX - size / 2}px, ${mouseY - size / 2}px, 0)`;
  }

  if (!frameId) {
    frameId = requestAnimationFrame(renderParallax);
  }
}

window.addEventListener("pointermove", onPointerMove);

const portfolioCards = document.getElementById("portfolioCards");
const portfolioLoadMore = document.getElementById("portfolioLoadMore");
const PORTFOLIO_BATCH_SIZE = 3;
const PREVIEW_BASE_URL = "https://image.thum.io/get/width/1200/noanimate/";
const PREVIEW_TIMEOUT_MS = 3500;

function preloadImage(url, timeoutMs = PREVIEW_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timeoutId = window.setTimeout(() => {
      img.src = "";
      reject(new Error("Preview load timeout"));
    }, timeoutMs);

    img.onload = () => {
      window.clearTimeout(timeoutId);
      resolve(url);
    };

    img.onerror = () => {
      window.clearTimeout(timeoutId);
      reject(new Error("Preview load failed"));
    };

    img.src = url;
  });
}

async function loadFirstAvailablePreview(siteUrl) {
  const candidates = [
    `${PREVIEW_BASE_URL}${siteUrl}`,
    `https://s.wordpress.com/mshots/v1/${encodeURIComponent(siteUrl)}?w=1200`
  ];

  for (const candidate of candidates) {
    try {
      const loadedUrl = await preloadImage(candidate);
      return loadedUrl;
    } catch (error) {
      // Try next provider.
    }
  }

  return null;
}

function setPortfolioPreviewsFromSites() {
  if (!portfolioCards) return;

  const cards = portfolioCards.querySelectorAll(".project-card");
  cards.forEach(async (card) => {
    const image = card.querySelector(".project-card__image");
    const openButton = card.querySelector(".js-open-case");
    const siteUrl = openButton?.dataset.site;

    if (!image || !siteUrl) return;

    const previewUrl = await loadFirstAvailablePreview(siteUrl);
    if (previewUrl) {
      image.src = previewUrl;
    }
  });
}

function updatePortfolioLoadMoreState() {
  if (!portfolioCards || !portfolioLoadMore) return;
  const hiddenCards = portfolioCards.querySelectorAll(".project-card.is-hidden");
  portfolioLoadMore.style.display = hiddenCards.length ? "inline-block" : "none";
}

if (portfolioCards && portfolioLoadMore) {
  portfolioLoadMore.addEventListener("click", () => {
    const hiddenCards = portfolioCards.querySelectorAll(".project-card.is-hidden");
    Array.from(hiddenCards)
      .slice(0, PORTFOLIO_BATCH_SIZE)
      .forEach((card) => card.classList.remove("is-hidden"));

    updatePortfolioLoadMoreState();
  });

  updatePortfolioLoadMoreState();
}

setPortfolioPreviewsFromSites();

const caseModal = document.getElementById("caseModal");
const caseFrame = document.getElementById("caseFrame");
const caseExternalLink = document.getElementById("caseExternalLink");
const caseButtons = document.querySelectorAll(".js-open-case");
const caseCloseTriggers = document.querySelectorAll("[data-close-case]");

function openCaseModal(siteUrl) {
  if (!caseModal || !caseFrame || !caseExternalLink || !siteUrl) return;
  caseFrame.src = siteUrl;
  caseExternalLink.href = siteUrl;
  caseModal.classList.add("is-open");
  caseModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeCaseModal() {
  if (!caseModal || !caseFrame) return;
  caseModal.classList.remove("is-open");
  caseModal.setAttribute("aria-hidden", "true");
  caseFrame.src = "about:blank";
  document.body.classList.remove("modal-open");
}

caseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const siteUrl = button.dataset.site;
    openCaseModal(siteUrl);
  });
});

caseCloseTriggers.forEach((trigger) => {
  trigger.addEventListener("click", closeCaseModal);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && caseModal?.classList.contains("is-open")) {
    closeCaseModal();
  }
});
