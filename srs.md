# Software Requirements Specification (SRS)

**Project Name:** IATOMFARM (I Am Tired Of Making Flashcards And Reviewers Manually)
**Version:** 1.1

## 1. Introduction

### 1.1 Purpose

The purpose of this document is to specify the software requirements for IATOMFARM, a single-page web application designed to automate the creation of study materials. It defines the system's intended behavior, user interface, architecture, and interactions with external APIs.

### 1.2 Product Scope

IATOMFARM aims to eliminate the manual effort of creating study reviewers and flashcards. Users can upload learning materials (PDF/DOCX), configure their desired output, and utilize the `gemini-3-flash-preview` model to automatically generate identification and enumeration questions. The system allows users to edit the generated items and export them as CSV (for Anki), DOCX, PDF, or directly as `.apkg` files.

## 2. Overall Description

### 2.1 Product Perspective

IATOMFARM operates as a standalone, single-page web application. It relies on a client-side frontend for user interaction and a backend service to parse uploaded documents, communicate with the Google Gemini API, and format the output for download.

### 2.2 User Interface Vision

The application consists of a minimalist, single-page interface with the following flow:

- **Landing View:** Displays the application title, subtitle, and a brief description acknowledging the existence of paid alternatives.
- **Upload Zone:** A drag-and-drop area for PDF or DOCX files.
- **Proceed Action:** A button that triggers a configuration modal.
- **Configuration Modal:** Allows users to set parameters (format, card count, question types).
- **Processing View:** Displays a loading animation while the AI processes the document.
- **Review/Edit View:** A staging area where users can review and modify the AI-generated items before finalization.
- **Download:** A final action button to download the requested file format.

## 3. Specific Requirements (Functional)

### 3.1 Document Upload Module

- **REQ-1.1:** The system shall provide a drag-and-drop zone and a traditional file picker.
- **REQ-1.2:** The system shall accept `.pdf` and `.docx` file formats.
- **REQ-1.3:** The system shall extract the raw text from the uploaded documents to be used as context for the AI prompt.

### 3.2 Configuration Modal

- **REQ-2.1:** The system shall present a modal after the user clicks "Proceed."
- **REQ-2.2:** The modal shall include a selector for the desired output format (CSV, DOCX, PDF, or APKG).
- **REQ-2.3:** The modal shall include a toggle switch for question types: "Identification Reviewer Only" or "Identification and Enumeration."
- **REQ-2.4:** The modal shall include a numeric input field allowing the user to specify the maximum number of cards/items to generate.

### 3.3 AI Processing Integration (`gemini-3-flash-preview`)

- **REQ-3.1:** The system shall construct a prompt combining the user's extracted text and the application's base instructions.
- **REQ-3.2:** The system shall instruct the AI using the following core prompt structure (dynamically adjusted based on user configuration):
  > "You are an Anki flashcard generator. I will give you a study module and your job is to extract every term, concept, acronym, mechanism, and definition. Output format: structured data [JSON]. Rules: The front must be a clear clue under 2 sentences. The back must be a short term/concept (1-5 words). Cover everything. Do not add commentary."
- **REQ-3.3:** If the user toggles "Enumeration," the system shall adjust the prompt to also generate list-based questions.
- **REQ-3.4:** The system shall limit the AI's output volume based on the user's specified card count.

### 3.4 Review and Edit Interface

- **REQ-4.1:** Upon successful AI generation, the system shall render the items in an editable list or table on the UI.
- **REQ-4.2:** The user shall be able to manually edit the text of the "Question/Clue" and the "Answer/Term" for any generated item.
- **REQ-4.3:** The user shall be able to delete specific items from the generated list.

### 3.5 Export and Download Module

- **REQ-5.1:** The system shall allow the user to trigger the final download after reviewing the items.
- **REQ-5.2:** If **CSV** is selected, the system shall format the output specifically for Anki import (escaping commas/quotes properly).
- **REQ-5.3:** If **DOCX or PDF** is selected, the system shall format the output as a clean, readable study guide.
- **REQ-5.4:** If **APKG** is selected, the system shall package the items directly into an Anki-importable deck.

## 4. System Architecture & Technical Stack

To achieve the requirements above, the system will utilize a decoupled Client-Server architecture.

### 4.1 Core Frameworks

- **Frontend:** React (via Vite) configured with Tailwind CSS for rapid UI development and a lightweight Single Page Application (SPA) experience.
- **Backend:** FastAPI (Python) to handle file uploads, asynchronous AI processing, and file generation efficiently.

### 4.2 Document Parsing

- **PDF Extraction:** `PyMuPDF` (fitz) for rapid text extraction, with `pdfplumber` as a fallback for highly structured, table-heavy layouts.
- **DOCX Extraction:** `python-docx` for parsing text structures from Word documents.

### 4.3 AI Integration

- **SDK:** `google-generativeai` utilizing the `gemini-3-flash-preview` model.
- **Data Handling:** API calls will leverage `response_mime_type="application/json"` to ensure predictable data formatting between the AI and the backend.

### 4.4 File Generation Engine

- **CSV Generation:** Python's native `csv` library.
- **DOCX Generation:** `python-docx` for creating formatted text documents.
- **PDF Generation:** `WeasyPrint` for converting HTML templates of the reviewer into styled PDF documents.
- **APKG Generation:** `genanki` to programmatically build native Anki decks, complete with defined models (Front/Back) and notes.

### 4.5 Deployment Infrastructure

- **Frontend Hosting:** Vercel, Netlify, or Cloudflare Pages (utilizing free tiers).
- **Backend Hosting:** Render or Railway (utilizing free/hobby tiers suitable for Python web services).

## 5. Non-Functional Requirements

### 5.1 Performance

- The UI shall remain responsive during file uploads and generation.
- A clear loading animation and status indicator must be visible while awaiting the AI API response to manage user expectations during long processing times.

### 5.2 Usability

- The application must allow a user to generate a reviewer in under 3 clicks (excluding the file upload step).
- The system should fail gracefully, providing clear error messages if a file cannot be parsed or the AI request times out.
