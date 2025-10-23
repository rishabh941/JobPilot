from telethon import TelegramClient
import re
import requests
import os
from dotenv import load_dotenv

# ------------------ Load Environment Variables ------------------
load_dotenv()

API_ID = int(os.getenv("TELEGRAM_API_ID"))
API_HASH = os.getenv("TELEGRAM_API_HASH")
PHONE = os.getenv("TELEGRAM_PHONE")
SPRING_API_BASE = os.getenv("SPRING_API_BASE")
CHANNELS = [c.strip() for c in os.getenv("TELEGRAM_CHANNELS", "").split(",") if c.strip()]

client = TelegramClient("jobpilot_session", API_ID, API_HASH)


# ------------------ Helper Functions ------------------

def extract_links(text):
    """Find all URLs in message text."""
    return re.findall(r"https?://[^\s]+", text)


def extract_title(text):
    """Extract possible job title from Telegram message."""
    first_line = text.split("\n")[0]
    return first_line[:60].strip() if len(first_line) > 0 else "Job Post"


def extract_company(text):
    """Try to extract company name, fallback to Unknown."""
    match = re.search(r"(?i)(?:at|with)\s+([A-Za-z0-9 &\.\-]+)", text)
    return match.group(1).strip() if match else "Unknown"


def push_to_backend(job):
    """Push each job to Spring Boot backend."""
    payload = {
        "title": job["title"],
        "company": job["company"],
        "location": job["location"],
        "experience": job["experience"],
        "url": job["url"],
        "skills": job["skills"],
        "source": "Telegram",
        "status": "pending",
        "postedAt": job["postedAt"]
    }

    try:
        response = requests.post(f"{SPRING_API_BASE}/add", json=payload)
        if response.status_code == 200:
            print(f"✅ Saved job: {job['title']} ({job['company']})")
        else:
            print(f"⚠️ Failed to save: {response.status_code} {response.text}")
    except Exception as e:
        print(f"❌ Error while saving job: {e}")


# ------------------ Core Scraper Logic ------------------

async def fetch_telegram_jobs(limit_per_channel=40):
    all_jobs = []
    total_messages = 0

    for channel in CHANNELS:
        print(f"\n📡 Fetching from: {channel}")
        async for msg in client.iter_messages(channel, limit=limit_per_channel):
            total_messages += 1

            # Debugging message preview
            preview = msg.message[:200] if msg.message else "[No text message]"
            print(f"\n📩 Message #{total_messages}: {preview}")

            if not msg.message and not msg.reply_markup:
                print("⚠️ Skipping: no text and no buttons.")
                continue

            text = msg.message.strip() if msg.message else ""
            links = extract_links(text)

            # 🧩 Check for inline buttons with URLs
            if msg.reply_markup and msg.reply_markup.rows:
                for row in msg.reply_markup.rows:
                    for button in row.buttons:
                        if hasattr(button, 'url') and button.url:
                            links.append(button.url)
                            print(f"🔗 Found button URL: {button.url}")

            if not links:
                print("⚠️ No links found in this message.")
                continue

            # Construct job entry
            for link in links:
                job = {
                    "title": extract_title(text),
                    "company": extract_company(text),
                    "location": "Remote" if "remote" in text.lower() or "work from home" in text.lower() else "N/A",
                    "experience": "N/A",
                    "skills": "",
                    "url": link,
                    "postedAt": msg.date.replace(tzinfo=None).isoformat()

                }

                print(f"💼 {job['title']} | 🏢 {job['company']} | 🔗 {link}")
                push_to_backend(job)
                all_jobs.append(job)

    print(f"\n✅ Total messages scanned: {total_messages}")
    print(f"✅ Total jobs saved: {len(all_jobs)}")
    return all_jobs


# ------------------ Main ------------------

async def main():
    print("🔐 Connecting to Telegram...")
    await client.start(PHONE)

    print("🚀 Fetching job posts from multiple channels...")
    await fetch_telegram_jobs(limit_per_channel=40)

    print("\n🎯 Job fetching completed!")
    await client.disconnect()


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
