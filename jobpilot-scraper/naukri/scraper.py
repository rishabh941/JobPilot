from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import time
import re


# 🧠 Convert "Posted 2 days ago" → ISO 8601 timestamp
def parse_posted_date(text: str):
    """Parse a human-readable posted date like '2 days ago' or 'Today' into ISO format."""
    if not text:
        return None

    text = text.lower().strip()
    now = datetime.now()

    if "today" in text:
        return now.isoformat()
    elif "yesterday" in text:
        return (now - timedelta(days=1)).isoformat()

    match = re.search(r"(\d+)\s*day", text)
    if match:
        days = int(match.group(1))
        return (now - timedelta(days=days)).isoformat()

    return None


# 🧩 Main scraping function
def scrape_jobs(role: str, location: str, pages: int = 3, experience_filter: str = None, posted: str = None, headless: bool = False):
    """
    Scrape job listings from Naukri based on role, location, and filters.
    Uses Playwright for rendering JavaScript and BeautifulSoup for parsing HTML.
    """

    print(f"🔍 Starting Naukri Scraper for Role='{role}' | Location='{location}'")
    print(f"🎯 Filters → Experience: {experience_filter or 'All'}, Posted: {posted or 'All'}")

    # Build the base Naukri URL dynamically
    base_url = f"https://www.naukri.com/{role.replace(' ', '-')}-jobs-in-{location.replace(' ', '-')}"
    filters = []
    if posted:
        filters.append(f"last={posted}")
    if filters:
        base_url += "?" + "&".join(filters)

    print(f"🧭 Base URL: {base_url}")

    # Parse experience range safely
    try:
        min_exp, max_exp = map(int, (experience_filter or "0-100").split("-"))
    except ValueError:
        min_exp, max_exp = 0, 100

    jobs = []
    total_scraped = 0
    total_filtered_out = 0

    # Launch Playwright browser
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless, slow_mo=150)
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 800},
        )
        page = context.new_page()

        # Scrape each page
        for page_num in range(1, pages + 1):
            url = f"{base_url}&page={page_num}" if "?" in base_url else f"{base_url}?page={page_num}"
            print(f"\n🌐 Visiting Page {page_num}: {url}")

            try:
                page.goto(url, wait_until="domcontentloaded", timeout=60000)
            except Exception as e:
                print(f"❌ Failed to load Page {page_num}: {e}")
                continue

            # Scroll gradually to load lazy content
            for _ in range(4):
                page.mouse.wheel(0, 400)
                time.sleep(1)
            page.wait_for_timeout(1500)

            html = page.content()
            soup = BeautifulSoup(html, "html.parser")

            # Select job cards
            job_cards = soup.select("div.cust-job-tuple.layout-wrapper.lay-2.sjw__tuple")
            print(f"🧾 Page {page_num}: Found {len(job_cards)} jobs")

            for card in job_cards:
                title_tag = card.select_one("a.title")
                company_tag = card.select_one("a.comp-name")
                location_tag = card.select_one("span.loc")
                exp_tag = card.select_one("li.exp") or card.select_one("span.exp")
                posted_tag = card.select_one("span.job-post-day")

                # --- Skills Extraction ---
                skill_elements = card.select("ul.tags-gt li, ul.tags.has-description li, span.chip")
                skills = ", ".join([s.text.strip() for s in skill_elements if s.text.strip()])

                # --- Experience Extraction ---
                experience_text = (
                    exp_tag.text.strip()
                    .replace("\xa0", " ")
                    .replace("–", "-")
                    .replace("—", "-")
                    .replace("Years", "Yrs")
                    if exp_tag else "N/A"
                )

                # --- Experience Filtering ---
                txt = experience_text.lower()
                nums = re.findall(r"\d+", txt)
                keep_job = True

                if "fresher" in txt:
                    keep_job = True
                elif len(nums) >= 2:
                    exp_low, exp_high = map(int, nums[:2])
                    if exp_high < min_exp or exp_low > max_exp:
                        keep_job = False
                elif len(nums) == 1:
                    exp_val = int(nums[0])
                    keep_job = min_exp <= exp_val <= max_exp
                else:
                    keep_job = False

                if not keep_job:
                    total_filtered_out += 1
                    continue

                # --- Posted Date ---
                posted_text = posted_tag.text.strip() if posted_tag else "N/A"
                posted_at = parse_posted_date(posted_text)

                # ✅ Construct Job Object
                job = {
                    "title": title_tag.text.strip() if title_tag else "N/A",
                    "company": company_tag.text.strip() if company_tag else "N/A",
                    "location": location_tag.text.strip() if location_tag else location,
                    "experience": experience_text,
                    "skills": skills,
                    "posted": posted_text,
                    "postedAt": posted_at,
                    "url": title_tag["href"] if title_tag and title_tag.has_attr("href") else "",
                }

                print(f"💼 {job['title']} | 🏢 {job['company']} | 📍 {job['location']} | ⏳ {job['experience']}")

                jobs.append(job)
                total_scraped += 1

            print(f"✅ Page {page_num} processed. Total jobs scraped so far: {total_scraped}")

        browser.close()

    print("\n📊 SCRAPING SUMMARY")
    print(f"✅ Total jobs scraped: {total_scraped}")
    print(f"🚫 Jobs filtered out by experience: {total_filtered_out}")

    return jobs

