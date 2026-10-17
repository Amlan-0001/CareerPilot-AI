from app.utils.pdf_utils import extract_text_from_pdf_file, extract_text_from_pdf_bytes


class PDFTool:
    @staticmethod
    def parse_pdf(file_path: str) -> str:
        return extract_text_from_pdf_file(file_path)

    @staticmethod
    def parse_pdf_bytes(pdf_bytes: bytes) -> str:
        return extract_text_from_pdf_bytes(pdf_bytes)


pdf_tool = PDFTool()
