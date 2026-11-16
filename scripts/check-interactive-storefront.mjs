import { createRequire } from "node:module";

const require = createRequire(
  "C:/Users/14488/AppData/Local/OpenAI/Codex/runtimes/cua_node/bbc9141fe9f920ac/bin/noop.js"
);
const { chromium } = require("playwright");

const site = process.env.SITE_URL || "http://127.0.0.1:4180/";
const screenshotRoot =
  "C:/Users/14488/Documents/Codex/2026-11-08/files-mentioned-by-the-user-luminara-2/outputs/interactive-storefront";
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"]
});

async function inspectViewport(width, height, mobile = false) {
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile: mobile,
    hasTouch: mobile,
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(site, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForFunction(() => Boolean(window.LuminaraMotion));
  await page.locator("#detailStage").scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);

  const initial = await page.evaluate(() => ({
    statementRemoved: !document.querySelector(".statement"),
    detailPoints: document.querySelectorAll(".detail-point").length,
    defaultCounter: document.querySelector("#detailCounter")?.textContent.trim(),
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth
  }));

  await page.locator(".detail-point").first().click();
  await page.waitForTimeout(1050);
  const detail = await page.evaluate(() => {
    const image = document.querySelector("#detailStage > img");
    return {
      title: document.querySelector("#detailTitle")?.textContent.trim(),
      counter: document.querySelector("#detailCounter")?.textContent.trim(),
      pressed: document.querySelector(".detail-point")?.getAttribute("aria-pressed"),
      imageScale: Number(new DOMMatrixReadOnly(getComputedStyle(image).transform).a.toFixed(3)),
      stageActive: document.querySelector("#detailStage")?.classList.contains("is-inspecting")
    };
  });

  await page.screenshot({
    path: `${screenshotRoot}-${width}-detail.png`,
    fullPage: false
  });

  await page.locator("#detailNext").click();
  await page.waitForTimeout(220);
  const nextCounter = await page.locator("#detailCounter").textContent();

  await page.locator("#detailReset").click();
  await page.waitForTimeout(800);
  const resetScale = await page.evaluate(() => {
    const image = document.querySelector("#detailStage > img");
    return Number(new DOMMatrixReadOnly(getComputedStyle(image).transform).a.toFixed(3));
  });

  await page.locator("#vitrine").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.locator('[data-filter="earrings"]').click();
  await page.waitForTimeout(720);
  await page.screenshot({
    path: `${screenshotRoot}-${width}-vitrine.png`,
    fullPage: false
  });
  await page.locator("#surpriseBtn").click();
  await page.waitForTimeout(1300);
  const surprise = await page.evaluate(() => ({
    drawerOpen: document.querySelector("#drawer")?.classList.contains("is-open"),
    productImage: document
      .querySelector("#drawer .d-media img")
      ?.currentSrc.split("/")
      .pop(),
    buttonReset:
      !document.querySelector("#surpriseBtn")?.disabled &&
      document.querySelector("#surpriseLabel")?.textContent.trim() ===
        "Let the edit choose"
  }));

  await context.close();
  return {
    viewport: `${width}x${height}`,
    initial,
    detail,
    nextCounter: nextCounter?.trim(),
    resetScale,
    surprise,
    errors
  };
}

const desktop = await inspectViewport(1440, 900);
const mobile = await inspectViewport(390, 844, true);

const reducedContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  reducedMotion: "reduce"
});
const reducedPage = await reducedContext.newPage();
const reducedErrors = [];
reducedPage.on("pageerror", (error) => reducedErrors.push(error.message));
reducedPage.on("console", (message) => {
  if (message.type() === "error") reducedErrors.push(message.text());
});
await reducedPage.goto(site, { waitUntil: "networkidle", timeout: 120000 });
await reducedPage.waitForFunction(() => Boolean(window.LuminaraMotion));
await reducedPage.locator("#detailStage").scrollIntoViewIfNeeded();
await reducedPage.locator(".detail-point").nth(1).click();
const reducedDetail = await reducedPage.evaluate(() => ({
  title: document.querySelector("#detailTitle")?.textContent.trim(),
  counter: document.querySelector("#detailCounter")?.textContent.trim(),
  reduceQuery: matchMedia("(prefers-reduced-motion: reduce)").matches,
  hoverQuery: matchMedia("(hover: hover)").matches,
  fineQuery: matchMedia("(pointer: fine)").matches,
  scale: Number(
    new DOMMatrixReadOnly(
      getComputedStyle(document.querySelector("#detailStage > img")).transform
    ).a.toFixed(3)
  )
}));
await reducedPage.locator("#surpriseBtn").click();
const reducedSurprise = await reducedPage.evaluate(() =>
  document.querySelector("#drawer")?.classList.contains("is-open")
);
await reducedContext.close();
await browser.close();

console.log(
  JSON.stringify(
    {
      desktop,
      mobile,
      reducedMotion: {
        detail: reducedDetail,
        surpriseDrawerOpen: reducedSurprise,
        errors: reducedErrors
      }
    },
    null,
    2
  )
);
