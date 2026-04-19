import type { CardType } from "@/lib/db";

export const AI_LINKS = [
  { label: "ChatGPT", href: "https://chatgpt.com/" },
  { label: "Gemini", href: "https://gemini.google.com/" },
  { label: "Grok", href: "https://grok.com/" },
  { label: "Claude", href: "https://claude.ai/" },
];

export const PROMPTS: Record<string, Record<CardType, string>> = {
  "pt-BR": {
    basic: `Crie um array JSON com 20 flashcards sobre [TÓPICO].

Regras obrigatórias:
- Retorne SOMENTE o JSON, sem explicação, sem markdown, sem blocos de código.
- Cada item deve ter "front" e "back".
- O "front" é a pergunta, definição ou contexto.
- O "back" é a resposta curta (palavra, termo ou frase).
- Você pode usar HTML básico nas strings para formatar o conteúdo: <p>, <b>, <strong>, <em>, <br>, <ul>, <li>.
- Não use classes CSS, não use style inline, não use imagens.

Formato exato esperado:
[
  {
    "front": "Usado para introduzir uma ideia contrastante, apesar disso",
    "back": "no entanto"
  },
  {
    "front": "<p>O verbo <strong>to be</strong> é usado para indicar:</p><ul><li>Estado ou condição</li><li>Profissão</li><li>Localização</li></ul>",
    "back": "<p><strong>am</strong> → I am a student.<br><strong>is</strong> → She is a doctor.<br><strong>are</strong> → They are at home.</p>"
  }
]`,

    typing: `Crie um array JSON com 20 flashcards de prática de digitação sobre [TÓPICO].

Neste tipo de card, o usuário lê o "front" e digita a resposta exata do "back".
Por isso, o "back" deve ser sempre uma resposta curta e objetiva, uma palavra, sigla ou frase curta.

Regras obrigatórias:
- Retorne SOMENTE o JSON, sem explicação, sem markdown, sem blocos de código.
- Cada item deve ter "front" e "back".
- O "front" pode ter HTML básico: <p>, <b>, <strong>, <em>, <br>.
- O "back" deve ser texto puro e curto (será comparado literalmente com o que o usuário digitar).

Formato exato esperado:
[
  {
    "front": "Qual é a capital da França?",
    "back": "Paris"
  },
  {
    "front": "<p>Qual preposição usamos para falar de <strong>horas específicas</strong>?</p><p>Exemplo: ___ 3pm</p>",
    "back": "at"
  }
]`,

    cloze: `Crie um array JSON com 20 flashcards de lacuna (cloze) sobre [TÓPICO].

Neste tipo de card, o app oculta uma palavra no texto usando a sintaxe {{c1::palavra}}.
O usuário vê o texto com a lacuna e tenta lembrar a palavra oculta.

Regras obrigatórias:
- Retorne SOMENTE o JSON, sem explicação, sem markdown, sem blocos de código.
- Cada item tem SOMENTE o campo "front", não há "back".
- Cada "front" deve conter pelo menos um {{c1::palavra}}.
- Você pode usar HTML básico: <p>, <b>, <strong>, <em>, <br>.
- Não oculte mais de uma lacuna por card.

Formato exato esperado:
[
  {
    "front": "A capital da França é {{c1::Paris}}."
  },
  {
    "front": "<p>Usamos <strong>{{c1::present simple}}</strong> para descrever hábitos e rotinas.</p>"
  }
]`,
  },

  en: {
    basic: `Create a JSON array with 20 flashcards about [TOPIC].

Mandatory rules:
- Return ONLY the JSON, no explanation, no markdown, no code blocks.
- Each item must have "front" and "back".
- "front" is the question, definition, or context clue.
- "back" is the short answer (a word, term, or phrase).
- You may use basic HTML inside the strings to format content: <p>, <b>, <strong>, <em>, <br>, <ul>, <li>.
- Do not use CSS classes, inline styles, or images.

Exact expected format:
[
  {
    "front": "Used to introduce a contrasting idea, in spite of that",
    "back": "however"
  },
  {
    "front": "<p>The verb <strong>to be</strong> is used to express:</p><ul><li>State or condition</li><li>Profession</li><li>Location</li></ul>",
    "back": "<p><strong>am</strong> → I am a student.<br><strong>is</strong> → She is a doctor.<br><strong>are</strong> → They are at home.</p>"
  }
]`,

    typing: `Create a JSON array with 20 typing practice flashcards about [TOPIC].

In this card type, the user reads "front" and types the exact "back" as the answer.
So "back" must always be short and objective, a single word, acronym, or short phrase.

Mandatory rules:
- Return ONLY the JSON, no explanation, no markdown, no code blocks.
- Each item must have "front" and "back".
- "front" may use basic HTML: <p>, <b>, <strong>, <em>, <br>.
- "back" must be plain text and short (it will be compared literally with what the user types).

Exact expected format:
[
  {
    "front": "What is the capital of France?",
    "back": "Paris"
  },
  {
    "front": "<p>Which preposition do we use for <strong>specific times</strong>?</p><p>Example: ___ 3pm</p>",
    "back": "at"
  }
]`,

    cloze: `Create a JSON array with 20 cloze deletion flashcards about [TOPIC].

In this card type, the app hides a word in the text using the syntax {{c1::word}}.
The user sees the sentence with a blank and tries to recall the hidden word.

Mandatory rules:
- Return ONLY the JSON, no explanation, no markdown, no code blocks.
- Each item has ONLY a "front" field, there is no "back".
- Each "front" must contain at least one {{c1::word}}.
- You may use basic HTML: <p>, <b>, <strong>, <em>, <br>.
- Do not hide more than one blank per card.

Exact expected format:
[
  {
    "front": "The capital of France is {{c1::Paris}}."
  },
  {
    "front": "<p>We use <strong>{{c1::present simple}}</strong> to describe habits and routines.</p>"
  }
]`,
  },

  es: {
    basic: `Crea un array JSON con 20 flashcards sobre [TEMA].

Reglas obligatorias:
- Devuelve SOLO el JSON, sin explicación, sin markdown, sin bloques de código.
- Cada elemento debe tener "front" y "back".
- "front" es la pregunta, definición o contexto.
- "back" es la respuesta corta (una palabra, término o frase).
- Puedes usar HTML básico dentro de las cadenas: <p>, <b>, <strong>, <em>, <br>, <ul>, <li>.
- No uses clases CSS, estilos inline ni imágenes.

Formato exacto esperado:
[
  {
    "front": "Se usa para introducir una idea contrastante, a pesar de eso",
    "back": "sin embargo"
  },
  {
    "front": "<p>El verbo <strong>to be</strong> se usa para expresar:</p><ul><li>Estado o condición</li><li>Profesión</li><li>Ubicación</li></ul>",
    "back": "<p><strong>am</strong> → I am a student.<br><strong>is</strong> → She is a doctor.<br><strong>are</strong> → They are at home.</p>"
  }
]`,

    typing: `Crea un array JSON con 20 flashcards de práctica de escritura sobre [TEMA].

En este tipo de tarjeta, el usuario lee el "front" y escribe la respuesta exacta del "back".
Por eso, el "back" debe ser siempre corto y objetivo, una palabra, sigla o frase corta.

Reglas obligatorias:
- Devuelve SOLO el JSON, sin explicación, sin markdown, sin bloques de código.
- Cada elemento debe tener "front" y "back".
- "front" puede usar HTML básico: <p>, <b>, <strong>, <em>, <br>.
- "back" debe ser texto plano y corto (se comparará literalmente con lo que el usuario escriba).

Formato exacto esperado:
[
  {
    "front": "¿Cuál es la capital de Francia?",
    "back": "París"
  },
  {
    "front": "<p>¿Qué preposición usamos para <strong>horas específicas</strong>?</p><p>Ejemplo: ___ 3pm</p>",
    "back": "at"
  }
]`,

    cloze: `Crea un array JSON con 20 flashcards de tipo cloze sobre [TEMA].

En este tipo de tarjeta, la app oculta una palabra usando la sintaxis {{c1::palabra}}.
El usuario ve la oración con un espacio en blanco e intenta recordar la palabra oculta.

Reglas obligatorias:
- Devuelve SOLO el JSON, sin explicación, sin markdown, sin bloques de código.
- Cada elemento tiene SOLO el campo "front", no hay "back".
- Cada "front" debe contener al menos un {{c1::palabra}}.
- Puedes usar HTML básico: <p>, <b>, <strong>, <em>, <br>.
- No ocultes más de un espacio en blanco por tarjeta.

Formato exacto esperado:
[
  {
    "front": "La capital de Francia es {{c1::París}}."
  },
  {
    "front": "<p>Usamos <strong>{{c1::present simple}}</strong> para describir hábitos y rutinas.</p>"
  }
]`,
  },
};
