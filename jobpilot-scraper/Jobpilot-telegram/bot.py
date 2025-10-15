import os
import re
import logging
import requests
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import ApplicationBuilder, MessageHandler, filters, ContextTypes

# Load environment variables
load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
BACKEND_URL = os.getenv("BACKEND_URL")

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)


def parse_job_message(text):
    """
    Extract minimal job info from forwarded messages.
    """
    job = {
        "title": None,
        "company": None,
        "apply_link": None,
        "raw_text": text
    }

    # Detect job keywords
    if not re.search(r"(hiring|job|opening|requirement|internship)", text, re.I):
        return None

    # Extract apply link
    link = re.search(r"https?://\S+", text)
    if link:
        job["apply_link"] = link.group(0)

    # Extract title and company
    title = re.search(r"for\s+([A-Za-z\s]+)\s+(at|in)\s", text, re.I)
    if title:
        job["title"] = title.group(1).strip()

    company = re.search(r"at\s+([A-Za-z0-9&.\s-]+)", text, re.I)
    if company:
        job["company"] = company.group(1).strip()

    return job


async def handle_forwarded(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Handle any forwarded messages sent to the bot.
    """
    msg = update.message
    text = msg.text or msg.caption or ""
    sender_name = msg.forward_from_chat.title if msg.forward_from_chat else "Unknown Group"

    logger.info(f"📥 Forwarded from {sender_name}: {text[:100]}...")

    job = parse_job_message(text)
    if not job:
        logger.info("No job keywords found, skipping.")
        return

    logger.info(f"✅ Detected job: {job}")

    try:
        resp = requests.post(BACKEND_URL, json=job, timeout=5)
        if resp.status_code == 200:
            logger.info("📤 Job sent to backend successfully.")
        else:
            logger.warning(f"⚠️ Backend returned status {resp.status_code}")
    except Exception as e:
        logger.error(f"❌ Failed to send job to backend: {e}")


if __name__ == "__main__":
    if not BOT_TOKEN:
        raise RuntimeError("❌ BOT_TOKEN not found in .env")

    app = ApplicationBuilder().token(BOT_TOKEN).build()
    app.add_handler(MessageHandler(filters.ALL, handle_forwarded))

    logger.info("🤖 JobPilot Forward Bot is running... forward any job messages to it.")
    app.run_polling()
