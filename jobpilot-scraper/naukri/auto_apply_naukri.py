from playwright.sync_api import sync_playwright
import requests
import time
from datetime import datetime
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
SPRING_API_BASE = "http://localhost:8080/api/jobs"
NAUKRI_EMAIL = os.getenv("NAUKRI_EMAIL")
NAUKRI_PASSWORD = os.getenv("NAUKRI_PASSWORD")

# Directory for success screenshots
os.makedirs("logs/applied_jobs", exist_ok=True)


# ----------------------- BACKEND COMMUNICATION -----------------------

def fetch_unapplied_jobs():
    """Fetch jobs with status null or pending from backend."""
    print("🧾 Fetching unapplied jobs from backend...")
    response = requests.get(f"{SPRING_API_BASE}/unapplied")
    if response.status_code == 200:
        jobs = response.json()
        print(f"✅ Found {len(jobs)} unapplied jobs.")
        return jobs
    else:
        print("❌ Failed to fetch jobs:", response.text)
        return []


def update_job_status(job_id, status, applied_at=None):
    """Update job status + appliedAt timestamp in backend."""
    params = {"status": status}
    if applied_at:
        params["appliedAt"] = applied_at
    response = requests.patch(f"{SPRING_API_BASE}/{job_id}/status", params=params)
    if response.status_code == 200:
        print(f"📦 Updated job {job_id} → {status} ({applied_at or 'no timestamp'})")
    else:
        print(f"⚠️ Failed to update job status for {job_id}: {response.text}")


# ----------------------- LOGIN + POPUP HANDLING -----------------------

def login_to_naukri(page):
    """Log into Naukri automatically (or manual fallback)."""
    print("🔐 Logging into Naukri...")
    page.goto("https://www.naukri.com/nlogin/login", wait_until="domcontentloaded")
    page.wait_for_timeout(2000)

    page.fill("#usernameField", NAUKRI_EMAIL)
    page.fill("#passwordField", NAUKRI_PASSWORD)

    login_btn = (
        page.query_selector(".btn-primary.loginButton")
        or page.query_selector("button[type='submit']")
        or page.query_selector("button:has-text('Login')")
    )

    if login_btn:
        print("🔘 Clicking login button...")
        login_btn.click()
    else:
        print("⚠️ Login button not found!")

    try:
        page.wait_for_url("**/mnjuser/homepage", timeout=20000)
        print("✅ Logged in successfully!")
    except:
        print("⚠️ Manual login required — please log in manually in the browser window.")
        input("🔹 Press ENTER once you’ve logged in...")


def handle_popup(page):
    """Automatically handle popups like gender/salary etc."""
    try:
        if page.query_selector("text='What is your gender identity?'"):
            page.click("text='Male'")
        if page.query_selector("text='Expected salary'"):
            input_box = page.query_selector("input") or page.query_selector("textarea")
            if input_box:
                input_box.fill("6 LPA")
                page.keyboard.press("Enter")

        submit_btn = (
            page.query_selector("text='Submit'")
            or page.query_selector("button:has-text('Continue')")
        )
        if submit_btn:
            submit_btn.click()
    except Exception as e:
        print(f"⚠️ Popup skipped: {e}")


# ----------------------- APPLY LOGIC -----------------------

def apply_to_job(page, job):
    """Visit job URL, attempt application, and detect success."""
    url = job.get("url")
    title = job.get("title", "N/A")
    company = job.get("company", "N/A")
    job_id = job.get("id")

    if not url:
        print(f"⚠️ Missing URL for job: {title}")
        return "failed", None

    try:
        print(f"\n➡️ Visiting: {title} @ {company}")
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(3000)

        # 🔍 Detect Apply Buttons
        apply_btn = (
            page.query_selector("button[title*='Apply']")
            or page.query_selector("a[title*='Apply']")
            or page.query_selector("button:has-text('Apply')")
            or page.query_selector("a:has-text('Apply')")
        )

        if not apply_btn:
            print("⚠️ No Apply button found.")
            return "failed", None

        btn_text = apply_btn.text_content().strip().lower()

        # 🟡 Case 1: Apply on Company Site → Pending
        if "company site" in btn_text or "employer site" in btn_text:
            print("🟡 Detected 'Apply on company site' → status pending.")
            return "pending", None

        # 🟢 Case 2: Normal Apply Flow
        apply_btn.click()
        handle_popup(page)
        page.wait_for_timeout(2500)

        # 🧠 Wait for success confirmation dynamically
        success = False
        for _ in range(8):  # wait up to 8 seconds
            success_box = page.query_selector("div:has-text('You have successfully applied')")
            if success_box:
                success = True
                break
            page.wait_for_timeout(1000)

        if success:
            applied_time = datetime.now().isoformat(timespec="seconds")
            print(f"✅ Successfully applied: {title} at {applied_time}")

            # 📸 Save screenshot proof
            safe_title = title.replace(" ", "_").replace("/", "_")
            screenshot_path = f"logs/applied_jobs/{safe_title}_{job_id}.png"
            page.screenshot(path=screenshot_path)
            print(f"🖼️ Screenshot saved → {screenshot_path}")

            return "applied", applied_time
        else:
            print(f"⚠️ No success confirmation detected for {title}")
            return "failed", None

    except Exception as e:
        print(f"❌ Error applying to {title}: {e}")
        return "failed", None


# ----------------------- MAIN SERVICE -----------------------

def auto_apply_jobs(limit=5):
    """Fetch jobs, auto-apply, and update statuses."""
    jobs = fetch_unapplied_jobs()
    if not jobs:
        print("✅ No unapplied jobs found.")
        return

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=200)
        context = browser.new_context()
        page = context.new_page()

        # Step 1: Login
        login_to_naukri(page)

        # Step 2: Apply to jobs
        for job in jobs[:limit]:
            job_id = job.get("id")
            status, applied_at = apply_to_job(page, job)
            update_job_status(job_id, status, applied_at)
            time.sleep(2)

        browser.close()

    print("\n🎯 Auto Apply process completed successfully!")


# ----------------------- ENTRY POINT -----------------------

if __name__ == "__main__":
    auto_apply_jobs(limit=14)
