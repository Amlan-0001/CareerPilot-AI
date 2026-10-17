import os
from typing import List
from app.core.config import settings


def ensure_dir_exists(directory_path: str):
    if not os.path.exists(directory_path):
        os.makedirs(directory_path, exist_ok=True)


def sanitize_filename(filename: str) -> str:
    return "".join(c for c in filename if c.isalnum() or c in ("-", "_", "."))
