import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, ListFlowable, ListItem
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.utils.common import ensure_dir_exists


def generate_tailored_resume_pdf(
    file_path: str,
    candidate_name: str,
    target_role: str,
    target_company: str,
    tailored_summary: str,
    tailored_bullet_points: list,
    contact_info: dict = None,
) -> str:
    """Generates a professional PDF resume document from tailored content."""
    dir_name = os.path.dirname(file_path)
    if dir_name:
        ensure_dir_exists(dir_name)

    doc = SimpleDocTemplate(
        file_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    name_style = ParagraphStyle(
        "CandidateName",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#1e1b4b"),
        spaceAfter=4,
    )

    role_style = ParagraphStyle(
        "CandidateRole",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#4f46e5"),
        spaceAfter=6,
    )

    contact_style = ParagraphStyle(
        "ContactInfo",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=12,
    )

    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=10,
        spaceAfter=4,
    )

    body_style = ParagraphStyle(
        "BodyTextCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6,
    )

    bullet_style = ParagraphStyle(
        "BulletCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=4,
    )

    story = []

    # Header Section
    story.append(Paragraph(candidate_name or "Candidate Name", name_style))
    role_text = f"Target Position: {target_role}" if target_role else "Professional Profile"
    if target_company:
        role_text += f" ({target_company})"
    story.append(Paragraph(role_text, role_style))

    if contact_info:
        contacts = []
        if contact_info.get("email"):
            contacts.append(contact_info["email"])
        if contact_info.get("phone"):
            contacts.append(contact_info["phone"])
        if contact_info.get("college"):
            contacts.append(contact_info["college"])
        if contact_info.get("linkedin_url"):
            contacts.append(contact_info["linkedin_url"])
        if contacts:
            story.append(Paragraph(" • ".join(contacts), contact_style))

    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceBefore=4, spaceAfter=10))

    # Executive Summary Section
    story.append(Paragraph("TAILORED PROFESSIONAL SUMMARY", heading_style))
    story.append(Paragraph(tailored_summary or "Professional background.", body_style))
    story.append(Spacer(1, 8))

    # Key Accomplishments / Tailored Highlights
    story.append(Paragraph("KEY EXPERIENCES & HIGHLIGHTS", heading_style))
    for bp in tailored_bullet_points or []:
        story.append(Paragraph(f"• {bp}", bullet_style))

    story.append(Spacer(1, 10))

    doc.build(story)
    return file_path
