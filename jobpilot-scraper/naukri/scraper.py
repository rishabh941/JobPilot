from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import time
import re


def scrape_jobs(role, location, pages=3, experience_filter=None, posted=None):
    """
    Scrape Naukri.com job listings with optional filters:
      - experience_filter: e.g. "0-1", "0-2"
      - posted: e.g. "7days", "3days"
      - pages: number of pages to scrape
    """
    print(f"🔍 Scraping Naukri for role='{role}' and location='{location}'")
    print(f"EXPERIENCE_FILTER ARG = {experience_filter!r}")

    # Build base URL dynamically
    base_url = f"https://www.naukri.com/{role.replace(' ', '-')}-jobs-in-{location.replace(' ', '-')}"
    filters = []

    if posted:
        filters.append(f"last={posted}")

    if filters:
        base_url += "?" + "&".join(filters)

    print(f"🧭 Base URL: {base_url}")

    jobs = []
    total_scraped = 0
    total_filtered_out = 0

    # Parse experience range
    try:
        min_exp, max_exp = map(int, (experience_filter or "0-100").split("-"))
    except:
        min_exp, max_exp = 0, 100

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=200)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                       "Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800},
        )

        page = context.new_page()

        for page_num in range(1, pages + 1):
            url = f"{base_url}&page={page_num}" if "?" in base_url else f"{base_url}?page={page_num}"
            print(f"\n🌐 Visiting: {url}")
            page.goto(url, wait_until="domcontentloaded", timeout=60000)
            page.wait_for_timeout(4000)
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.wait_for_timeout(2000)

            html = page.content()
            soup = BeautifulSoup(html, "html.parser")

            job_cards = soup.select("div.cust-job-tuple.layout-wrapper.lay-2.sjw__tuple")
            print(f"🧾 Page {page_num}: Found {len(job_cards)} jobs")

            for card in job_cards:
                title_tag = card.select_one("a.title")
                company_tag = card.select_one("a.comp-name")
                location_tag = card.select_one("span.loc")
                exp_tag = card.select_one("li.exp") or card.select_one("span.exp")
                salary_tag = card.select_one("span.salary")
                posted_tag = card.select_one("span.job-post-day")

                # Normalize and clean experience text
                experience_text = (
                    exp_tag.text.strip()
                    .replace("\xa0", " ")
                    .replace("–", "-")
                    .replace("—", "-")
                    .replace("Years", "Yrs")
                    if exp_tag else "N/A"
                )

                txt = experience_text.lower()
                nums = re.findall(r"\d+", txt)

                keep_job = True

                # --- Debugging Experience Filter ---
                if "fresher" in txt:
                    print(f"✅ KEEP Fresher ({experience_text})")
                    keep_job = True
                elif len(nums) >= 2:
                    exp_low, exp_high = map(int, nums[:2])
                    if exp_high < min_exp or exp_low > max_exp:
                        print(f"❌ SKIP {experience_text} (range {exp_low}-{exp_high} outside {min_exp}-{max_exp})")
                        keep_job = False
                    else:
                        print(f"✅ KEEP {experience_text} (range {exp_low}-{exp_high} within {min_exp}-{max_exp})")
                elif len(nums) == 1:
                    exp_val = int(nums[0])
                    if exp_val < min_exp or exp_val > max_exp:
                        print(f"❌ SKIP {experience_text} (value {exp_val} outside {min_exp}-{max_exp})")
                        keep_job = False
                    else:
                        print(f"✅ KEEP {experience_text} (value {exp_val} within {min_exp}-{max_exp})")
                else:
                    print(f"❌ SKIP {experience_text} (no digits & not Fresher)")
                    keep_job = False

                if not keep_job:
                    total_filtered_out += 1
                    continue

                # --- Job Info ---
                job = {
                    "title": title_tag.text.strip() if title_tag else "N/A",
                    "company": company_tag.text.strip() if company_tag else "N/A",
                    "location": location_tag.text.strip() if location_tag else location,
                    "experience": experience_text,
                    "salary": salary_tag.text.strip() if salary_tag else "N/A",
                    "posted": posted_tag.text.strip() if posted_tag else "N/A",
                    "url": title_tag["href"] if title_tag and title_tag.has_attr("href") else ""
                }

                jobs.append(job)
                total_scraped += 1

            time.sleep(2)

        browser.close()

    print(f"\n✅ Total jobs scraped after filtering: {total_scraped}")
    print(f"❌ Jobs filtered out due to experience: {total_filtered_out}")

    return jobs
