from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import time
import re
from urllib.parse import urlparse, urlunparse


def parse_posted_date(text: str):
    if not text:
        return None
    text = text.lower().strip()
    now = datetime.now()
    if "today" in text:
        return now.isoformat()
    if "yesterday" in text:
        return (now - timedelta(days=1)).isoformat()
    m = re.search(r"(\d+)\s*day", text)
    if m:
        return (now - timedelta(days=int(m.group(1)))).isoformat()
    return None


def auto_scroll_page(page, max_scrolls=10, scroll_pause=0.6):
    """same scrolling logic, just faster"""
    prev = 0
    for _ in range(max_scrolls):
        page.evaluate("window.scrollBy(0, document.body.scrollHeight)")
        time.sleep(scroll_pause)
        curr = page.evaluate("document.body.scrollHeight")
        if curr == prev:
            break
        prev = curr


def scrape_jobs(role: str, location: str, pages: int = 3,
                experience_filter: str = None, posted: str = None,
                headless: bool = False):
    print(f"🔍 Starting scraper for '{role}' in '{location}' ({pages} pages)")
    role_slug = role.replace(' ', '-').lower()
    loc_slug = location.replace(' ', '-').lower()
    base_url = f"https://www.naukri.com/{role_slug}-jobs-in-{loc_slug}"

    try:
        min_exp, max_exp = map(int, (experience_filter or "0-100").split("-"))
    except ValueError:
        min_exp, max_exp = 0, 100

    jobs = []
    total_scraped = 0
    total_filtered = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        context = browser.new_context(
            user_agent=("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/120.0.0.0 Safari/537.36"),
            viewport={"width": 1280, "height": 800},
        )
        page = context.new_page()

        # -------- pagination pattern detection (kept identical) ----------
        page.goto(base_url, wait_until="domcontentloaded", timeout=60000)
        time.sleep(1.5)
        auto_scroll_page(page, max_scrolls=3, scroll_pause=0.5)
        pagination_links = page.eval_on_selector_all(
            "a[href*='-jobs-in-']", "els => els.map(e => e.href)"
        )
        detected_pattern = next((l for l in pagination_links if "-2" in l), None)
        base_path = detected_pattern.split("-2")[0] if detected_pattern else base_url
        # ----------------------------------------------------------------

        # 🔁 loop 1 → N  (unchanged logic)
        for page_num in range(1, int(pages) + 1):
            url = base_url if page_num == 1 else f"{base_path}-{page_num}"
            print(f"🌐 Page {page_num}: {url}")
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=45000)
            except Exception as e:
                print(f"⚠️ skip {page_num}: {e}")
                continue

            auto_scroll_page(page)
            soup = BeautifulSoup(page.content(), "html.parser")
            job_cards = soup.select("div.cust-job-tuple.layout-wrapper.lay-2.sjw__tuple")
            print(f"📄 {len(job_cards)} jobs found")

            for c in job_cards:
                title_tag = c.select_one("a.title")
                company_tag = c.select_one("a.comp-name")
                location_tag = c.select_one("span.loc")
                exp_tag = c.select_one("li.exp") or c.select_one("span.exp")
                posted_tag = c.select_one("span.job-post-day")

                skill_elements = c.select("ul.tags-gt li, ul.tags.has-description li, span.chip")
                skills = ", ".join(s.text.strip() for s in skill_elements if s.text.strip())

                exp_text = (exp_tag.text.strip()
                            .replace("\xa0", " ").replace("–", "-").replace("—", "-")
                            .replace("Years", "Yrs") if exp_tag else "N/A")

                txt = exp_text.lower()
                nums = re.findall(r"\d+", txt)
                keep = True
                if "fresher" in txt:
                    keep = True
                elif len(nums) >= 2:
                    lo, hi = map(int, nums[:2])
                    if hi < min_exp or lo > max_exp:
                        keep = False
                elif len(nums) == 1:
                    val = int(nums[0])
                    keep = min_exp <= val <= max_exp
                else:
                    keep = False

                if not keep:
                    total_filtered += 1
                    continue

                posted_text = posted_tag.text.strip() if posted_tag else "N/A"
                job = {
                    "title": title_tag.text.strip() if title_tag else "N/A",
                    "company": company_tag.text.strip() if company_tag else "N/A",
                    "location": location_tag.text.strip() if location_tag else location,
                    "experience": exp_text,
                    "skills": skills,
                    "posted": posted_text,
                    "postedAt": parse_posted_date(posted_text),
                    "url": title_tag["href"] if title_tag and title_tag.has_attr("href") else "",
                }
                jobs.append(job)
                total_scraped += 1

            print(f"✅ Page {page_num} done. Total so far {total_scraped}")

        browser.close()

    print("\n📊 Done")
    print(f"✅ Scraped: {total_scraped}")
    print(f"🚫 Filtered out: {total_filtered}")
    return jobs
