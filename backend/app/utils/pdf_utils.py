import pypdf
from app.core.logging import logger


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """Extracts raw text content from PDF byte data using pypdf."""
    try:
        import io
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        extracted_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text.append(text)
        return "\n".join(extracted_text).strip()
    except Exception as e:
        logger.error(f"Failed to extract text from PDF bytes: {e}")
        return ""


def extract_text_from_pdf_file(file_path: str) -> str:
    """Extracts raw text content from a PDF file path."""
    try:
        reader = pypdf.PdfReader(file_path)
        extracted_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text.append(text)
        return "\n".join(extracted_text).strip()
    except Exception as e:
        logger.error(f"Failed to extract text from PDF file {file_path}: {e}")
        return ""
