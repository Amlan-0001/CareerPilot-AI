# Phase 10: Chrome Extension — Human-in-the-Loop Form Autofill & JD Analyzer

## Implementation Details & Iteration 2 Architecture

### Overview
Phase 10 provides a Manifest V3 Chrome Extension (`extension/`) that extracts job descriptions from active web browser tabs, computes real-time match scores against candidate `AIMemory`, and features a mandatory **Human-in-the-Loop Approval Gate** for job application autofill.

### 1. Mandatory Human Approval Architecture (SCAN -> PROPOSE -> REVIEW -> FILL)
- **Scanning Page NEVER Fills the DOM**:
  1. **Step 1 (Scan & Propose)**: Clicking **`🔍 Scan Page & Propose Autofill`** detects page fields and fetches proposed values from AI Memory and Question-Answering agents. The extension displays the proposals list and **STOPS**. No DOM elements on the page are modified.
  2. **Step 2 (Human Review & Edit)**: The extension renders individual Proposal Cards displaying:
     - Question Title (e.g., *"Your Name"*, *"College / University name"*, *"Your Working Domain"*).
     - Editable `<input>` or `<textarea>` allowing the candidate to tweak proposed answers.
     - Source & Confidence Badges (`Source: AI Memory` / `Confidence: High`).
     - Action Toggles (`[✓ Approve]` / `[✕ Reject]`).
  3. **Step 3 (Explicit Human Execution)**: Only upon clicking **`✓ Fill Approved Fields`**, the extension sends approved fields to `content.js` to perform DOM injection.
  4. **Step 4 (Verification Reporting)**: Displays exact execution summary (`Detected`, `Approved`, `Filled`, `Manual`).

### 2. Multi-Strategy Field Detection & Google Forms ARIA Support (`extension/content.js`)
- **Question Label Extraction**: Fallback chain inspecting explicit `<label for="id">`, nested `<label>`, parent container headings (`[role="heading"]`, `.M7eMe`, `h1-h6`), `aria-labelledby`, and `aria-label`.
- **Google Forms ARIA Radio Groups**: Detects `[role="radiogroup"]` / `[role="radio"]`, matches choice labels against user memory, and triggers `.click()`.
- **Google Forms ARIA Dropdowns**: Detects `[role="listbox"]` / `[role="option"]`, opens listbox options, and selects matching values.
- **Resume File Upload**: Standard browser security forbids JavaScript from assigning programmatic file paths to file inputs (`C:\fakepath\`). The extension focuses the file upload container, reports `Manual Action Required for File Upload`, and avoids false success claims.

### 3. Verification Summary
- **Pytest Suite**: 7/7 backend tests passed cleanly in 1.34s.
- **JD Analyzer Regression**: Verified 100% operational (JD extraction -> analysis -> match score -> missing skills).
- **Extension Status**: 100% verified and operational.
