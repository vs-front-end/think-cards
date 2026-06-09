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

  de: {
    basic: `Erstelle ein JSON-Array mit 20 Lernkarten über [THEMA].

Verbindliche Regeln:
- Gib NUR das JSON zurück, ohne Erklärung, ohne Markdown, ohne Codeblöcke.
- Jedes Element muss "front" und "back" haben.
- "front" ist die Frage, Definition oder der Kontexthinweis.
- "back" ist die kurze Antwort (ein Wort, Begriff oder Satz).
- Du darfst einfaches HTML in den Strings zur Formatierung verwenden: <p>, <b>, <strong>, <em>, <br>, <ul>, <li>.
- Verwende keine CSS-Klassen, keine Inline-Styles und keine Bilder.

Genau erwartetes Format:
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

    typing: `Erstelle ein JSON-Array mit 20 Tipp-Übungskarten über [THEMA].

Bei diesem Kartentyp liest der Nutzer "front" und tippt genau die Antwort aus "back".
Daher muss "back" immer kurz und eindeutig sein, ein einzelnes Wort, ein Akronym oder ein kurzer Satz.

Verbindliche Regeln:
- Gib NUR das JSON zurück, ohne Erklärung, ohne Markdown, ohne Codeblöcke.
- Jedes Element muss "front" und "back" haben.
- "front" darf einfaches HTML verwenden: <p>, <b>, <strong>, <em>, <br>.
- "back" muss reiner, kurzer Text sein (es wird wörtlich mit der Eingabe des Nutzers verglichen).

Genau erwartetes Format:
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

    cloze: `Erstelle ein JSON-Array mit 20 Lückentext-Karten (Cloze) über [THEMA].

Bei diesem Kartentyp verbirgt die App ein Wort im Text mit der Syntax {{c1::wort}}.
Der Nutzer sieht den Satz mit einer Lücke und versucht, das verborgene Wort zu erinnern.

Verbindliche Regeln:
- Gib NUR das JSON zurück, ohne Erklärung, ohne Markdown, ohne Codeblöcke.
- Jedes Element hat NUR ein Feld "front", es gibt kein "back".
- Jedes "front" muss mindestens ein {{c1::wort}} enthalten.
- Du darfst einfaches HTML verwenden: <p>, <b>, <strong>, <em>, <br>.
- Verbirg nicht mehr als eine Lücke pro Karte.

Genau erwartetes Format:
[
  {
    "front": "The capital of France is {{c1::Paris}}."
  },
  {
    "front": "<p>We use <strong>{{c1::present simple}}</strong> to describe habits and routines.</p>"
  }
]`,
  },

  fr: {
    basic: `Crée un tableau JSON contenant 20 cartes mémoire sur [SUJET].

Règles obligatoires :
- Renvoie UNIQUEMENT le JSON, sans explication, sans markdown, sans blocs de code.
- Chaque élément doit avoir "front" et "back".
- "front" est la question, la définition ou l'indice de contexte.
- "back" est la réponse courte (un mot, un terme ou une phrase).
- Tu peux utiliser du HTML basique dans les chaînes pour mettre en forme le contenu : <p>, <b>, <strong>, <em>, <br>, <ul>, <li>.
- N'utilise pas de classes CSS, ni de styles inline, ni d'images.

Format exact attendu :
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

    typing: `Crée un tableau JSON contenant 20 cartes d'entraînement à la saisie sur [SUJET].

Dans ce type de carte, l'utilisateur lit "front" et tape exactement la réponse de "back".
Ainsi, "back" doit toujours être court et précis : un seul mot, un sigle ou une courte phrase.

Règles obligatoires :
- Renvoie UNIQUEMENT le JSON, sans explication, sans markdown, sans blocs de code.
- Chaque élément doit avoir "front" et "back".
- "front" peut utiliser du HTML basique : <p>, <b>, <strong>, <em>, <br>.
- "back" doit être du texte brut et court (il sera comparé littéralement à ce que l'utilisateur tape).

Format exact attendu :
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

    cloze: `Crée un tableau JSON contenant 20 cartes à trous (cloze) sur [SUJET].

Dans ce type de carte, l'application masque un mot dans le texte avec la syntaxe {{c1::mot}}.
L'utilisateur voit la phrase avec un blanc et tente de se rappeler le mot masqué.

Règles obligatoires :
- Renvoie UNIQUEMENT le JSON, sans explication, sans markdown, sans blocs de code.
- Chaque élément n'a QUE le champ "front", il n'y a pas de "back".
- Chaque "front" doit contenir au moins un {{c1::mot}}.
- Tu peux utiliser du HTML basique : <p>, <b>, <strong>, <em>, <br>.
- Ne masque pas plus d'un blanc par carte.

Format exact attendu :
[
  {
    "front": "The capital of France is {{c1::Paris}}."
  },
  {
    "front": "<p>We use <strong>{{c1::present simple}}</strong> to describe habits and routines.</p>"
  }
]`,
  },

  it: {
    basic: `Crea un array JSON con 20 flashcard su [ARGOMENTO].

Regole obbligatorie:
- Restituisci SOLO il JSON, senza spiegazioni, senza markdown, senza blocchi di codice.
- Ogni elemento deve avere "front" e "back".
- "front" è la domanda, la definizione o l'indizio di contesto.
- "back" è la risposta breve (una parola, un termine o una frase).
- Puoi usare HTML di base all'interno delle stringhe per formattare il contenuto: <p>, <b>, <strong>, <em>, <br>, <ul>, <li>.
- Non usare classi CSS, stili inline o immagini.

Formato esatto atteso:
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

    typing: `Crea un array JSON con 20 flashcard di pratica di digitazione su [ARGOMENTO].

In questo tipo di scheda, l'utente legge "front" e digita esattamente la risposta di "back".
Per questo "back" deve essere sempre breve e preciso: una singola parola, una sigla o una frase breve.

Regole obbligatorie:
- Restituisci SOLO il JSON, senza spiegazioni, senza markdown, senza blocchi di codice.
- Ogni elemento deve avere "front" e "back".
- "front" può usare HTML di base: <p>, <b>, <strong>, <em>, <br>.
- "back" deve essere testo semplice e breve (verrà confrontato letteralmente con ciò che l'utente digita).

Formato esatto atteso:
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

    cloze: `Crea un array JSON con 20 flashcard a completamento (cloze) su [ARGOMENTO].

In questo tipo di scheda, l'app nasconde una parola nel testo usando la sintassi {{c1::parola}}.
L'utente vede la frase con uno spazio vuoto e cerca di ricordare la parola nascosta.

Regole obbligatorie:
- Restituisci SOLO il JSON, senza spiegazioni, senza markdown, senza blocchi di codice.
- Ogni elemento ha SOLO il campo "front", non c'è "back".
- Ogni "front" deve contenere almeno un {{c1::parola}}.
- Puoi usare HTML di base: <p>, <b>, <strong>, <em>, <br>.
- Non nascondere più di uno spazio vuoto per scheda.

Formato esatto atteso:
[
  {
    "front": "The capital of France is {{c1::Paris}}."
  },
  {
    "front": "<p>We use <strong>{{c1::present simple}}</strong> to describe habits and routines.</p>"
  }
]`,
  },

  ja: {
    basic: `[トピック]に関するフラッシュカードを20枚含むJSON配列を作成してください。

必須ルール:
- JSONのみを返してください。説明、マークダウン、コードブロックは不要です。
- 各項目には "front" と "back" が必要です。
- "front" は質問、定義、または文脈のヒントです。
- "back" は短い答え（単語、用語、またはフレーズ）です。
- 内容の書式設定には、文字列内で基本的なHTMLを使用できます: <p>, <b>, <strong>, <em>, <br>, <ul>, <li>。
- CSSクラス、インラインスタイル、画像は使用しないでください。

期待される正確な形式:
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

    typing: `[トピック]に関するタイピング練習用フラッシュカードを20枚含むJSON配列を作成してください。

このカードタイプでは、ユーザーは "front" を読み、"back" の答えを正確に入力します。
そのため "back" は常に短く明確でなければなりません。単語、頭字語、または短いフレーズにしてください。

必須ルール:
- JSONのみを返してください。説明、マークダウン、コードブロックは不要です。
- 各項目には "front" と "back" が必要です。
- "front" は基本的なHTMLを使用できます: <p>, <b>, <strong>, <em>, <br>。
- "back" はプレーンテキストで短くしてください（ユーザーの入力と文字どおり比較されます）。

期待される正確な形式:
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

    cloze: `[トピック]に関する穴埋め（クローズ）フラッシュカードを20枚含むJSON配列を作成してください。

このカードタイプでは、アプリが {{c1::単語}} という構文を使って文中の単語を隠します。
ユーザーは空欄のある文を見て、隠された単語を思い出そうとします。

必須ルール:
- JSONのみを返してください。説明、マークダウン、コードブロックは不要です。
- 各項目には "front" フィールドのみがあり、"back" はありません。
- 各 "front" には少なくとも1つの {{c1::単語}} を含めてください。
- 基本的なHTMLを使用できます: <p>, <b>, <strong>, <em>, <br>。
- 1枚のカードにつき空欄は1つだけにしてください。

期待される正確な形式:
[
  {
    "front": "The capital of France is {{c1::Paris}}."
  },
  {
    "front": "<p>We use <strong>{{c1::present simple}}</strong> to describe habits and routines.</p>"
  }
]`,
  },

  ko: {
    basic: `[주제]에 대한 플래시카드 20개를 담은 JSON 배열을 생성하세요.

필수 규칙:
- 오직 JSON만 반환하세요. 설명, 마크다운, 코드 블록은 사용하지 마세요.
- 각 항목에는 "front"와 "back"이 있어야 합니다.
- "front"는 질문, 정의 또는 문맥 단서입니다.
- "back"은 짧은 답변(단어, 용어 또는 구절)입니다.
- 내용 서식을 위해 문자열 안에서 기본 HTML을 사용할 수 있습니다: <p>, <b>, <strong>, <em>, <br>, <ul>, <li>.
- CSS 클래스, 인라인 스타일, 이미지는 사용하지 마세요.

정확히 기대되는 형식:
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

    typing: `[주제]에 대한 타이핑 연습용 플래시카드 20개를 담은 JSON 배열을 생성하세요.

이 카드 유형에서는 사용자가 "front"를 읽고 "back"의 답을 정확히 입력합니다.
따라서 "back"은 항상 짧고 명확해야 합니다. 단어, 약어 또는 짧은 구절이어야 합니다.

필수 규칙:
- 오직 JSON만 반환하세요. 설명, 마크다운, 코드 블록은 사용하지 마세요.
- 각 항목에는 "front"와 "back"이 있어야 합니다.
- "front"는 기본 HTML을 사용할 수 있습니다: <p>, <b>, <strong>, <em>, <br>.
- "back"은 일반 텍스트로 짧아야 합니다(사용자가 입력한 내용과 그대로 비교됩니다).

정확히 기대되는 형식:
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

    cloze: `[주제]에 대한 빈칸 채우기(클로즈) 플래시카드 20개를 담은 JSON 배열을 생성하세요.

이 카드 유형에서는 앱이 {{c1::단어}} 구문을 사용하여 텍스트의 단어를 숨깁니다.
사용자는 빈칸이 있는 문장을 보고 숨겨진 단어를 떠올리려 합니다.

필수 규칙:
- 오직 JSON만 반환하세요. 설명, 마크다운, 코드 블록은 사용하지 마세요.
- 각 항목에는 "front" 필드만 있으며 "back"은 없습니다.
- 각 "front"에는 최소한 하나의 {{c1::단어}}가 포함되어야 합니다.
- 기본 HTML을 사용할 수 있습니다: <p>, <b>, <strong>, <em>, <br>.
- 카드 한 장당 빈칸은 하나만 숨기세요.

정확히 기대되는 형식:
[
  {
    "front": "The capital of France is {{c1::Paris}}."
  },
  {
    "front": "<p>We use <strong>{{c1::present simple}}</strong> to describe habits and routines.</p>"
  }
]`,
  },

  ru: {
    basic: `Создай JSON-массив из 20 карточек на тему [ТЕМА].

Обязательные правила:
- Верни ТОЛЬКО JSON, без объяснений, без markdown, без блоков кода.
- Каждый элемент должен содержать "front" и "back".
- "front" — это вопрос, определение или контекстная подсказка.
- "back" — это короткий ответ (слово, термин или фраза).
- Ты можешь использовать базовый HTML внутри строк для форматирования содержимого: <p>, <b>, <strong>, <em>, <br>, <ul>, <li>.
- Не используй CSS-классы, инлайн-стили и изображения.

Точный ожидаемый формат:
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

    typing: `Создай JSON-массив из 20 карточек для тренировки набора текста на тему [ТЕМА].

В этом типе карточек пользователь читает "front" и вводит точный ответ из "back".
Поэтому "back" всегда должен быть коротким и однозначным: одно слово, аббревиатура или короткая фраза.

Обязательные правила:
- Верни ТОЛЬКО JSON, без объяснений, без markdown, без блоков кода.
- Каждый элемент должен содержать "front" и "back".
- "front" может использовать базовый HTML: <p>, <b>, <strong>, <em>, <br>.
- "back" должен быть простым коротким текстом (он будет сравниваться буквально с тем, что вводит пользователь).

Точный ожидаемый формат:
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

    cloze: `Создай JSON-массив из 20 карточек с пропусками (cloze) на тему [ТЕМА].

В этом типе карточек приложение скрывает слово в тексте с помощью синтаксиса {{c1::слово}}.
Пользователь видит предложение с пропуском и пытается вспомнить скрытое слово.

Обязательные правила:
- Верни ТОЛЬКО JSON, без объяснений, без markdown, без блоков кода.
- Каждый элемент содержит ТОЛЬКО поле "front", поля "back" нет.
- Каждый "front" должен содержать хотя бы один {{c1::слово}}.
- Ты можешь использовать базовый HTML: <p>, <b>, <strong>, <em>, <br>.
- Не скрывай больше одного пропуска на карточку.

Точный ожидаемый формат:
[
  {
    "front": "The capital of France is {{c1::Paris}}."
  },
  {
    "front": "<p>We use <strong>{{c1::present simple}}</strong> to describe habits and routines.</p>"
  }
]`,
  },

  zh: {
    basic: `创建一个包含 20 张关于 [主题] 的抽认卡的 JSON 数组。

强制规则：
- 只返回 JSON，不要解释，不要 markdown，不要代码块。
- 每个条目必须包含 "front" 和 "back"。
- "front" 是问题、定义或语境提示。
- "back" 是简短的答案（一个单词、术语或短语）。
- 你可以在字符串内使用基本 HTML 来格式化内容：<p>、<b>、<strong>、<em>、<br>、<ul>、<li>。
- 不要使用 CSS 类、内联样式或图片。

期望的确切格式：
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

    typing: `创建一个包含 20 张关于 [主题] 的打字练习抽认卡的 JSON 数组。

在这种卡片类型中，用户阅读 "front" 并输入与 "back" 完全一致的答案。
因此 "back" 必须始终简短而明确：一个单词、缩写或简短短语。

强制规则：
- 只返回 JSON，不要解释，不要 markdown，不要代码块。
- 每个条目必须包含 "front" 和 "back"。
- "front" 可以使用基本 HTML：<p>、<b>、<strong>、<em>、<br>。
- "back" 必须是纯文本且简短（它会与用户输入的内容逐字比较）。

期望的确切格式：
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

    cloze: `创建一个包含 20 张关于 [主题] 的填空（cloze）抽认卡的 JSON 数组。

在这种卡片类型中，应用使用 {{c1::单词}} 语法隐藏文本中的一个单词。
用户看到带有空白的句子，并尝试回忆被隐藏的单词。

强制规则：
- 只返回 JSON，不要解释，不要 markdown，不要代码块。
- 每个条目只有 "front" 字段，没有 "back"。
- 每个 "front" 必须至少包含一个 {{c1::单词}}。
- 你可以使用基本 HTML：<p>、<b>、<strong>、<em>、<br>。
- 每张卡片不要隐藏超过一个空白。

期望的确切格式：
[
  {
    "front": "The capital of France is {{c1::Paris}}."
  },
  {
    "front": "<p>We use <strong>{{c1::present simple}}</strong> to describe habits and routines.</p>"
  }
]`,
  },
};
