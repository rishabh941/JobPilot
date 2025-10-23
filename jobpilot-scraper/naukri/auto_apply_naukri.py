from playwright.sync_api import sync_playwright
import requests
import time
from datetime import datetime
from dotenv import load_dotenv
import os

# ----------------------- ENVIRONMENT -----------------------
load_dotenv()
SPRING_JOB_API = "http://localhost:8080/api/jobs"
SPRING_AUTOAPPLY_API = "http://localhost:8080/api/autoapply"
NAUKRI_EMAIL = os.getenv("NAUKRI_EMAIL")
NAUKRI_PASSWORD = os.getenv("NAUKRI_PASSWORD")

os.makedirs("logs/applied_jobs", exist_ok=True)


# ----------------------- BACKEND COMMUNICATION -----------------------

def fetch_unapplied_jobs():
    print("🧾 Fetching unapplied jobs from backend...")
    response = requests.get(f"{SPRING_JOB_API}/unapplied")
    if response.status_code == 200:
        jobs = response.json()
        print(f"✅ Found {len(jobs)} unapplied jobs.")
        return jobs
    else:
        print("❌ Failed to fetch jobs:", response.text)
        return []


def update_job_status(job_id, status, applied_at=None):
    params = {"status": status}
    if applied_at:
        params["appliedAt"] = applied_at
    response = requests.patch(f"{SPRING_JOB_API}/{job_id}/status", params=params)
    if response.status_code == 200:
        print(f"📦 Updated job {job_id} → {status}")
    else:
        print(f"⚠️ Failed to update job status for {job_id}: {response.text}")


def update_progress(processed, successful):
    """Send progress updates to Spring Boot backend."""
    try:
        requests.post(f"{SPRING_AUTOAPPLY_API}/update-progress", json={
            "processed": processed,
            "successful": successful
        })
        print(f"📊 Progress sent → processed={processed}, successful={successful}")
    except Exception as e:
        print(f"⚠️ Failed to update progress: {e}")


# ----------------------- LOGIN + POPUPS -----------------------

def login_to_naukri(page):
    print("🔐 Logging into Naukri...")
    page.goto("https://www.naukri.com/nlogin/login", wait_until="domcontentloaded")
    page.fill("#usernameField", NAUKRI_EMAIL)
    page.fill("#passwordField", NAUKRI_PASSWORD)
    btn = page.query_selector(".btn-primary.loginButton") or page.query_selector("button[type='submit']")
    if btn:
        btn.click()
    try:
        page.wait_for_url("**/mnjuser/homepage", timeout=20000)
        print("✅ Logged in successfully!")
    except:
        print("⚠️ Manual login required. Please login manually.")
        input("Press ENTER once logged in...")


def handle_popup(page):
    try:
        if page.query_selector("text='What is your gender identity?'"):
            page.click("text='Male'")
        if page.query_selector("text='Expected salary'"):
            input_box = page.query_selector("input") or page.query_selector("textarea")
            if input_box:
                input_box.fill("6 LPA")
                page.keyboard.press("Enter")
        submit_btn = page.query_selector("text='Submit'") or page.query_selector("button:has-text('Continue')")
        if submit_btn:
            submit_btn.click()
    except Exception as e:
        print(f"⚠️ Popup skipped: {e}")


# ----------------------- APPLY LOGIC -----------------------

def apply_to_job(page, job):
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

        if "company site" in btn_text or "employer site" in btn_text:
            print("🟡 Detected 'Apply on company site' → status pending.")
            return "pending", None

        apply_btn.click()
        handle_popup(page)
        page.wait_for_timeout(2500)

        success = False
        for _ in range(8):
            if page.query_selector("div:has-text('You have successfully applied')"):
                success = True
                break
            page.wait_for_timeout(1000)

        if success:
            applied_time = datetime.now().isoformat(timespec="seconds")
            print(f"✅ Successfully applied: {title} at {applied_time}")
            safe_title = title.replace(" ", "_").replace("/", "_")
            page.screenshot(path=f"logs/applied_jobs/{safe_title}_{job_id}.png")
            return "applied", applied_time
        else:
            print(f"⚠️ No success confirmation detected for {title}")
            return "failed", None
    except Exception as e:
        print(f"❌ Error applying to {title}: {e}")
        return "failed", None


# ----------------------- MAIN SERVICE -----------------------

def auto_apply_jobs(limit=5, stop_event=None):
    jobs = fetch_unapplied_jobs()
    if not jobs:
        print("✅ No unapplied jobs found.")
        update_progress(0, 0)
        # Ensure the dashboard reflects stopped state even on empty queue
        try:
            requests.post(f"{SPRING_AUTOAPPLY_API}/stop")
        except Exception as e:
            print(f"⚠️ Failed to notify stop on empty queue: {e}")
        return {"processed": 0, "successful": 0}

    processed = 0
    successful = 0
    update_progress(processed, successful)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=200)
        context = browser.new_context()
        page = context.new_page()

        login_to_naukri(page)

        for job in jobs[:limit]:
            # Cooperative cancellation from FastAPI background controller (if used)
            if stop_event is not None and getattr(stop_event, "is_set", lambda: False)():
                print("⏹️ Stop requested — exiting early.")
                break
            status, applied_at = apply_to_job(page, job)
            update_job_status(job["id"], status, applied_at)
            processed += 1
            if status == "applied":
                successful += 1
            update_progress(processed, successful)  # ✅ Live update to Spring
            time.sleep(2)

        browser.close()

    print(f"\n🎯 Auto Apply completed! Processed: {processed}, Successful: {successful}")
    update_progress(processed, successful)
    # Signal the dashboard to stop showing "Running"
    try:
        requests.post(f"{SPRING_AUTOAPPLY_API}/stop")  # ✅ Mark as stopped
    except Exception as e:
        print(f"⚠️ Failed to notify stop: {e}")
    return {"processed": processed, "successful": successful}


if __name__ == "__main__":
    auto_apply_jobs(limit=10)
