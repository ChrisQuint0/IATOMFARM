import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=api_key)

def generate_flashcards(text: str, card_count: int = 20, include_enumeration: bool = False):
    """
    Generates flashcards from the provided text using Gemini.
    """
    # Using the specific model name available in this environment
    model = genai.GenerativeModel('models/gemini-3-flash-preview')
    
    enumeration_instruction = "Include list-based enumeration questions where applicable (e.g., 'What are the 3 types of X?')." if include_enumeration else "STRICTLY AVOID list-based enumeration or 'What are the types of X' questions. Stick to single-term concepts."
    limit_instruction = f"Generate exactly {card_count} items if possible, but do not exceed this limit." if card_count > 0 else "Generate AT LEAST 30 items to ensure comprehensive coverage of the entire module, but strictly avoid repeating the same concept or question. Extract as many as needed to cover everything important."
    
    prompt = f"""
    You are an Anki flashcard generator. I will give you a study module and your job is to extract every term, concept, acronym, mechanism, and definition.
    
    Output format: STRICT JSON array of objects.
    JSON Schema: [{{"question": "string", "answer": "string"}}]
    
    Rules:
    1. The 'question' must be a clear clue under 2 sentences.
    2. The 'answer' must be a short term/concept (1-5 words).
    3. Cover everything important in the text.
    4. Do not add any commentary, explanations, or markdown formatting (like ```json) outside the JSON array itself.
    5. {limit_instruction}
    6. {enumeration_instruction}
    
    Source Text:
    {text}
    """
    
    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        # Parse the JSON response
        cards = json.loads(response.text)
        return cards
    
    except Exception as e:
        print(f"AI Generation Error: {str(e)}")
        raise e
