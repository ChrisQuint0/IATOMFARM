### Phase 1: Project Setup & "Hello World" (The Plumbing)

**Goal:** Get the frontend and backend running locally and talking to each other via CORS.

- **Step 1.1 (Frontend):** Initialize the React project using Vite and configure Tailwind CSS. Create a basic single-page layout (Header, main content area).
- **Step 1.2 (Backend):** Initialize the FastAPI Python project. Set up a virtual environment and install core dependencies (`fastapi`, `uvicorn`, `python-multipart`).
- **Step 1.3 (Integration):** Configure CORS middleware in FastAPI to allow requests from your local React app. Create a simple `GET /health` endpoint and have the React app fetch and display it to prove they are connected.

### Phase 2: Document Parsing (Backend Focus)

**Goal:** Successfully upload files and extract clean text from them. (Do not touch the AI yet).

- **Step 2.1:** Create a `POST /upload` endpoint in FastAPI that accepts a file.
- **Step 2.2:** Integrate `PyMuPDF` (fitz) to extract text if the uploaded file is a PDF.
- **Step 2.3:** Integrate `python-docx` to extract text if the uploaded file is a DOCX.
- **Step 2.4:** Return the extracted text as a JSON response to verify it works perfectly.

### Phase 3: Gemini AI Integration (Backend Focus)

**Goal:** Send the extracted text to Gemini and get structured JSON back.

- **Step 3.1:** Install `google-generativeai`. Set up the API key using environment variables (`.env`).
- **Step 3.2:** Write a utility function that takes the extracted text, user configurations (card count, enumeration toggle), and constructs the prompt.
- **Step 3.3:** Call `gemini-3-flash-preview` enforcing a JSON schema output (Array of objects: `[{"question": "...", "answer": "..."}]`).
- **Step 3.4:** Update the `/upload` endpoint to return this generated JSON array instead of the raw text.

### Phase 4: Frontend UI & State Management (Frontend Focus)

**Goal:** Build the user interface to upload, configure, and edit the results.

- **Step 4.1:** Build the Drag-and-Drop file upload zone and the "Proceed" button.
- **Step 4.2:** Build the Configuration Modal (Select output format, toggle Enumeration, set card count limit).
- **Step 4.3:** Wire up the UI to send the file and configuration to the FastAPI backend, while showing a loading animation.
- **Step 4.4:** Build the Review/Edit Table. Render the JSON response from the backend into editable input fields so the user can modify or delete cards.

### Phase 5: Export & Generation Endpoints (Backend Focus)

**Goal:** Convert the finalized JSON array into the actual downloadable files.

- **Step 5.1 (CSV):** Create a `POST /generate/csv` endpoint that takes the JSON array and returns a formatted CSV file (Anki-ready).
- **Step 5.2 (DOCX):** Create a `POST /generate/docx` endpoint that takes the JSON array and generates a formatted Word document.
- **Step 5.3 (PDF):** Create a `POST /generate/pdf` endpoint (using `WeasyPrint` or similar) to generate the PDF reviewer.
- **Step 5.4 (APKG - Optional but recommended):** Create a `POST /generate/apkg` endpoint using `genanki` to package the deck.

### Phase 6: Final Integration & Polish (Full Stack)

**Goal:** Tie the export endpoints to the frontend and clean up the user experience.

- **Step 6.1:** Add a "Download" button to the Frontend Review Table that sends the edited JSON to the correct `/generate` endpoint based on the user's initial selection.
- **Step 6.2:** Handle the file download blob on the frontend so it saves directly to the user's computer.
- **Step 6.3:** Add global error handling (e.g., what happens if the file is too big, or the Gemini API times out?).
