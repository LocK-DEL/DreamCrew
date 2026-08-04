import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = {
  page: new URL("../src/app/[locale]/projects/page.tsx", import.meta.url),
  card: new URL("../src/components/project-card.tsx", import.meta.url),
  filters: new URL("../src/components/projects/project-filters.tsx", import.meta.url),
  marketplace: new URL("../src/lib/projects/marketplace.mjs", import.meta.url),
  home: new URL("../src/app/[locale]/page.tsx", import.meta.url),
};

async function code(path) {
  return (await readFile(path, "utf8")).replace(/\s+/g, " ");
}

test("loads hosted projects with allowlisted URL-driven filters", async () => {
  const [page, marketplace] = await Promise.all([code(files.page), code(files.marketplace)]);

  assert.match(page, /searchParams/);
  assert.match(page, /marketplaceFiltersFromSearchParams/);
  assert.match(page, /loadPublicProjects\(filters, locale\)/);
  assert.match(page, /ProjectFilters/);
  assert.match(marketplace, /PROJECT_CATEGORIES/);
  assert.match(marketplace, /PROJECT_STAGES/);
  assert.match(marketplace, /COLLABORATION_LEVELS/);
  assert.match(marketplace, /LOCATION_MODES/);
  assert.match(marketplace, /safeSkillSlug/);
});

test("keeps hosted empty states separate from explicitly labeled examples", async () => {
  const page = await code(files.page);

  assert.match(page, /result\.configured/);
  assert.match(page, /demoProjectViews\(locale\)/);
  assert.match(page, /source === "demo"/);
  assert.match(page, /load-failed/);
  assert.match(page, /\/projects\/new/);
  assert.doesNotMatch(page, /featuredProjects/);
});

test("renders real detail links, source labels, and optional match explanations", async () => {
  const card = await code(files.card);

  assert.match(card, /ProjectCardView/);
  assert.match(card, /\/projects\/\$\{project\.slug\}/);
  assert.match(card, /project\.source === "demo"/);
  assert.match(card, /matchSummary/);
  assert.match(card, /matchSummary\.reasons/);
  assert.match(card, /matchSummary\.cautions/);
  assert.doesNotMatch(card, /projects#\$\{project\.slug\}/);
});

test("uses real publish navigation and the new card shape on the home page", async () => {
  const [home, filters] = await Promise.all([code(files.home), code(files.filters)]);

  assert.match(home, /demoProjectViews\(locale\)/);
  assert.match(home, /projectCardView/);
  assert.match(filters, /URLSearchParams/);
  assert.match(filters, /category/);
  assert.match(filters, /stage/);
  assert.match(filters, /collaborationLevel/);
  assert.match(filters, /locationMode/);
  assert.match(filters, /sort/);
});
