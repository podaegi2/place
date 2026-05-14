import { NextRequest, NextResponse } from "next/server";
import puppeteer, { Frame, Page } from "puppeteer";

interface PlaceItem {
  rank: number;
  placeId: string;
  name: string;
  category: string;
  address: string;
  isTarget: boolean;
}

function extractPlaceId(url: string): string | null {
  const m = url.match(/\/place\/(\d+)/);
  return m ? m[1] : null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function findListFrame(page: Page): Promise<Frame | null> {
  // 카테고리별로 hospital/list, restaurant/list, place/list 등 다양함
  try {
    return await page.waitForFrame(
      (f) =>
        f.url().includes("pcmap.place.naver.com") &&
        f.url().includes("/list"),
      { timeout: 20000 }
    );
  } catch {
    return (
      page
        .frames()
        .find(
          (f) =>
            f.url().includes("pcmap.place.naver.com") &&
            f.url().includes("/list")
        ) ?? null
    );
  }
}

async function scrollToLoadMore(frame: Frame): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await frame
      .evaluate(() => {
        const el = document.querySelector("#_pcmap_list_scroll_container");
        if (el) el.scrollTop = el.scrollHeight;
      })
      .catch(() => {});
    await sleep(2500);
  }
}

export async function POST(request: NextRequest) {
  let body: { keyword?: string; placeUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 형식이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const { keyword, placeUrl } = body;

  if (!keyword?.trim()) {
    return NextResponse.json({ error: "검색 키워드를 입력해주세요." }, { status: 400 });
  }
  if (!placeUrl?.trim()) {
    return NextResponse.json({ error: "플레이스 URL을 입력해주세요." }, { status: 400 });
  }

  const targetPlaceId = extractPlaceId(placeUrl);
  if (!targetPlaceId) {
    return NextResponse.json(
      {
        error:
          "유효한 플레이스 URL이 아닙니다. URL에 /place/{숫자} 형식이 포함되어야 합니다.",
      },
      { status: 400 }
    );
  }

  // Railway(Linux) 환경에서는 시스템 Chromium 사용
  const isProduction = process.env.NODE_ENV === "production";
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: isProduction
      ? (process.env.CHROMIUM_PATH ?? "/usr/bin/chromium")
      : undefined,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--window-size=1280,900",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    const encodedKeyword = encodeURIComponent(keyword.trim());
    try {
      await page.goto(
        `https://map.naver.com/p/search/${encodedKeyword}`,
        { waitUntil: "load", timeout: 20000 }
      );
    } catch {
      // load 타임아웃이어도 계속 진행
    }

    await sleep(3000);

    const listFrame = await findListFrame(page);
    if (!listFrame) {
      const frameUrls = page.frames().map((f) => f.url()).join(" | ");
      return NextResponse.json(
        { error: `검색 결과 프레임을 찾지 못했습니다. (${frameUrls})` },
        { status: 500 }
      );
    }

    await listFrame
      .waitForSelector("#_pcmap_list_scroll_container", { timeout: 15000 })
      .catch(() => null);

    await sleep(1000);
    await scrollToLoadMore(listFrame);

    // React fiber에서 place ID + DOM에서 이름/카테고리/주소 추출
    const results: PlaceItem[] = await listFrame.evaluate(
      (targetId: string) => {
        const lis = document.querySelectorAll(
          "#_pcmap_list_scroll_container > ul > li"
        );

        return Array.from(lis).map((li, i) => {
          // ── React fiber에서 place ID 추출 ──────────────────────────
          let placeId = "";
          const fiberKey = Object.keys(li).find(
            (k) =>
              k.startsWith("__reactFiber") ||
              k.startsWith("__reactInternals")
          );
          if (fiberKey) {
            const visited = new Set<object>();
            const queue: object[] = [(li as unknown as Record<string, object>)[fiberKey]];
            outer: while (queue.length) {
              const fiber = queue.shift() as Record<string, unknown> | null;
              if (!fiber || visited.has(fiber)) continue;
              visited.add(fiber);

              const props =
                (fiber.memoizedProps as Record<string, unknown>) ||
                (fiber.pendingProps as Record<string, unknown>);
              if (props) {
                const item = props.item as Record<string, unknown> | undefined;
                if (item?.id && /^\d+$/.test(String(item.id))) {
                  placeId = String(item.id);
                  break outer;
                }
              }
              if (fiber.child) queue.push(fiber.child as object);
              if (fiber.sibling) queue.push(fiber.sibling as object);
              if (fiber.return && !visited.has(fiber.return as object))
                queue.push(fiber.return as object);
            }
          }

          // ── DOM에서 이름 추출 ──────────────────────────────────────
          const nameSelectors = [
            ".place_bluelink",
            ".uD1F4",
            "a span",
            "strong",
          ];
          let name = "";
          for (const sel of nameSelectors) {
            const t = li.querySelector(sel)?.textContent?.trim();
            if (t) { name = t; break; }
          }
          if (!name) name = `플레이스 ${i + 1}`;

          // ── 카테고리 ───────────────────────────────────────────────
          let category = "";
          for (const sel of [
            "[class*='category']",
            "[class*='type']",
            "span.KCMnt",
            ".lnJFt",
          ]) {
            const t = li.querySelector(sel)?.textContent?.trim();
            if (t) { category = t; break; }
          }

          // ── 주소 ──────────────────────────────────────────────────
          let address = "";
          for (const sel of [
            "[class*='address']",
            "[class*='addr']",
            "span.LDgIH",
            ".Jjm_z",
          ]) {
            const t = li.querySelector(sel)?.textContent?.trim();
            if (t) { address = t; break; }
          }

          return {
            rank: i + 1,
            placeId,
            name,
            category,
            address,
            isTarget: placeId === targetId,
          };
        });
      },
      targetPlaceId
    );

    return NextResponse.json({
      success: true,
      keyword,
      targetPlaceId,
      targetPlace: results.find((r) => r.isTarget) ?? null,
      totalResults: results.length,
      allResults: results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `스크래핑 중 오류: ${message}` },
      { status: 500 }
    );
  } finally {
    await browser.close();
  }
}
