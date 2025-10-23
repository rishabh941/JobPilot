from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout
from playwright_stealth import stealth_sync
import requests
import os
import time
from datetime import datetime
from dotenv import load_dotenv
import json

load_dotenv()

SPRING_API_BASE = os.getenv("SPRING_API_BASE", "http://localhost:8080/api/jobs")
WELLFOUND_EMAIL = os.getenv("WELLFOUND_EMAIL")
WELLFOUND_PASSWORD = os.getenv("WELLFOUND_PASSWORD")
STORAGE_PATH = "wellfound_storage.json"


# -------------------- Backend Save --------------------
def push_to_backend(job):
    payload = {
        "title": job["title"],
        "company": job["company"],
        "location": job["location"],
        "experience": job.get("experience", "N/A"),
        "salary": job.get("salary", "N/A"),
        "url": job["url"],
        "skills": job.get("skills", ""),
        "source": "Wellfound",
        "status": "pending",
        "postedAt": job.get("postedAt"),
    }

    try:
        resp = requests.post(f"{SPRING_API_BASE}/add", json=payload, timeout=30)
        if 200 <= resp.status_code < 300:
            print(f"✅ Saved job: {job['title']} ({job['company']})")
        else:
            print(f"⚠️ Failed to save job: {resp.status_code} {resp.text}")
    except Exception as e:
        print(f"❌ Error saving job: {e}")


# -------------------- Login / Session --------------------
def ensure_storage_state(page, context):
    """
    If no saved session, open login page and wait until user manually logs in.
    Then save cookies + localStorage to wellfound_storage.json.
    """
    if os.path.exists(STORAGE_PATH):
        print(f"♻️ Found existing session: {STORAGE_PATH}")
        return True

    print("🔐 No saved session found — opening login page for manual login...")
    page.goto("https://wellfound.com/login", wait_until="domcontentloaded")

    print("🕓 Please log in manually in the browser window.")
    print("💡 Tip: Once you see your Wellfound homepage or jobs dashboard, you're logged in.")
    print("👉 After that, come back here and press Enter in this terminal.")
    input("Press Enter when you’ve successfully logged in...")

    # ✅ Give Playwright a few seconds to detect that login finished
    try:
        page.wait_for_url("**/jobs**", timeout=20000)
    except Exception:
        print("⚠️ Could not confirm redirect automatically (that's okay). Proceeding to save session.")

    try:
        context.storage_state(path=STORAGE_PATH)
        print(f"💾 Session saved successfully → {STORAGE_PATH}")
        return True
    except Exception as e:
        print(f"❌ Failed to save session: {e}")
        return False



# -------------------- Utility: human scrolling --------------------
def human_scroll(page, passes=5):
    for _ in range(passes):
        page.mouse.wheel(0, 1500)
        time.sleep(1.5)


# -------------------- Scraper --------------------
def scrape_wellfound_stealth(role="Software Engineer", pages=1, headless=False):
    q = role.strip()
    print(f"🔍 Scraping Wellfound for '{q}' (Stealth Mode + Persistent Session)")

    base_url = f"https://wellfound.com/jobs?remote=true&keywords={q.replace(' ', '%20')}"

    with sync_playwright() as p:
        # Step 1 — Prepare browser and context
        browser = p.chromium.launch(headless=headless, args=["--no-sandbox", "--disable-dev-shm-usage"])

        # Use storage_state if available
        if os.path.exists(STORAGE_PATH):
            context = browser.new_context(storage_state=STORAGE_PATH,
                                          user_agent=("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                                                      "AppleWebKit/537.36 (KHTML, like Gecko) "
                                                      "Chrome/120.0.0.0 Safari/537.36"),
                                          viewport={"width": 1280, "height": 800})
        else:
            context = browser.new_context(user_agent=("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                                                      "AppleWebKit/537.36 (KHTML, like Gecko) "
                                                      "Chrome/120.0.0.0 Safari/537.36"),
                                          viewport={"width": 1280, "height": 800})

        page = context.new_page()

        # Step 2 — Apply stealth
        try:
            stealth_sync(page)
        except Exception as e:
            print(f"⚠️ Stealth failed: {e}")

        # Step 3 — Ensure session
        ensure_storage_state(page, context)

        # Step 4 — Go to job listings
        try:
            print(f"🌐 Opening: {base_url}")
            page.goto(base_url, wait_until="networkidle", timeout=40000)
        except Exception as e:
            print(f"⚠️ Could not open {base_url}: {e}")
            browser.close()
            return

        # Step 5 — Human-like scrolling to load jobs
        human_scroll(page, passes=6)

        # Step 6 — Extract job cards
        cards = page.query_selector_all("div[data-testid='JobResult']") or page.query_selector_all("li.job-result") or []
        print(f"🧾 Found {len(cards)} jobs")

        for idx, card in enumerate(cards, start=1):
            try:
                title_el = card.query_selector("h3") or card.query_selector("a h3")
                title = title_el.inner_text().strip() if title_el else "N/A"

                company_el = card.query_selector("h4") or card.query_selector("h4 a")
                company = company_el.inner_text().strip() if company_el else "Unknown"

                location_el = card.query_selector("span[data-testid='JobLocation']") or card.query_selector("p")
                location = location_el.inner_text().strip() if location_el else "N/A"

                salary_el = card.query_selector("span:has-text('₹')") or card.query_selector("div:has-text('₹')")
                salary = salary_el.inner_text().strip() if salary_el else "N/A"

                link_el = card.query_selector("a")
                href = link_el.get_attribute("href") if link_el else None
                url = f"https://wellfound.com{href}" if href and href.startswith("/") else href or ""

                job = {
                    "title": title,
                    "company": company,
                    "location": location,
                    "experience": "N/A",
                    "skills": "",
                    "salary": salary,
                    "url": url,
                    "postedAt": datetime.utcnow().isoformat() + "Z"
                }

                print(f"[{idx}] 💼 {title} | 🏢 {company} | 📍 {location} | 💰 {salary}")
                push_to_backend(job)
                time.sleep(0.4)

            except Exception as e:
                print(f"⚠️ Error processing job #{idx}: {e}")

        # Step 7 — Save session again
        try:
            context.storage_state(path=STORAGE_PATH)
            print("💾 Updated session saved.")
        except Exception as e:
            print(f"⚠️ Could not re-save session: {e}")

        browser.close()

    print("\n🎯 Wellfound scraping completed.")


# -------------------- Run --------------------
if __name__ == "__main__":
    scrape_wellfound_stealth(role="Software Engineer", pages=1, headless=False)

