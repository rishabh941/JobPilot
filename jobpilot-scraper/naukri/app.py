from fastapi import FastAPI
from scraper import scrape_jobs
from auto_apply_naukri import auto_apply_jobs

import threading
import time


app = FastAPI(
    title="JobPilot Scraper API",
    description="Playwright-powered Naukri job scraper with filtering and debug logging",
    version="1.0"
)


@app.get("/scrape-jobs")
def scrape_jobs_endpoint(
    role: str,
    location: str,
    pages: int = 5,
    experience_filter: str = None,
    posted: str = None
):
    print("🔥 experience_filter received in API:", experience_filter)
    jobs = scrape_jobs(role, location, pages, experience_filter, posted)
    return {"jobs": jobs}


# ----------------- Auto-apply background controller -----------------
# A very small in-memory controller using a thread and stop Event.
_auto_thread = None
_auto_stop_event = None
_auto_stats = {"status": "idle", "processed": 0, "successful": 0, "started_at": None}


def _run_auto_apply(limit: int, stop_event: threading.Event):
    global _auto_stats
    _auto_stats = {"status": "running", "processed": 0, "successful": 0, "started_at": time.time()}
    try:
        result = auto_apply_jobs(limit=limit, stop_event=stop_event)
        _auto_stats.update({"processed": result.get("processed", 0), "successful": result.get("successful", 0)})
    except Exception as e:
        print("❌ Background auto-apply error:", e)
        _auto_stats["status"] = "error"
        _auto_stats["error"] = str(e)
    finally:
        if _auto_stats.get("status") != "error":
            _auto_stats["status"] = "finished"


@app.post("/auto-apply/start")
def start_auto_apply(limit: int = 10):
    """Start auto-apply in background. Returns immediately with current status."""
    global _auto_thread, _auto_stop_event, _auto_stats
    if _auto_thread and _auto_thread.is_alive():
        return {"status": "already_running"}

    _auto_stop_event = threading.Event()
    _auto_thread = threading.Thread(target=_run_auto_apply, args=(limit, _auto_stop_event), daemon=True)
    _auto_thread.start()
    return {"status": "started"}


@app.post("/auto-apply/stop")
def stop_auto_apply():
    """Signal the running auto-apply background thread to stop."""
    global _auto_thread, _auto_stop_event, _auto_stats
    if not _auto_thread or not _auto_thread.is_alive():
        return {"status": "not_running"}
    _auto_stop_event.set()
    _auto_thread.join(timeout=10)
    if _auto_thread.is_alive():
        return {"status": "stop_pending"}
    return {"status": "stopped"}


@app.get("/auto-apply/status")
def auto_apply_status():
    global _auto_thread, _auto_stop_event, _auto_stats
    running = bool(_auto_thread and _auto_thread.is_alive())
    stats = dict(_auto_stats)
    stats.update({"running": running})
    return stats


@app.get("/auto-apply/logs")
def auto_apply_logs(limit: int = 50):
    """Return last lines from the local auto-apply logs directory for quick debugging."""
    import glob
    import os

    log_dir = os.path.join(os.path.dirname(__file__), "logs", "applied_jobs")
    if not os.path.isdir(log_dir):
        return {"logs": []}

    files = sorted(glob.glob(os.path.join(log_dir, "*.png")), key=os.path.getmtime, reverse=True)[:limit]
    # Return filenames and timestamps (no binary data)
    result = []
    for f in files:
        result.append({"file": os.path.basename(f), "mtime": os.path.getmtime(f)})
    return {"logs": result}


@app.post("/auto-apply/run-once")
def auto_apply_run_once(limit: int = 10):
    """Run auto-apply synchronously (blocking) — same as existing `/auto-apply` behavior."""
    try:
        result = auto_apply_jobs(limit=limit)
        return {"status": "completed", "result": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# Backward-compatibility alias for existing callers expecting /auto-apply
@app.post("/auto-apply")
def auto_apply_compat(limit: int = 10):
    return auto_apply_run_once(limit)

