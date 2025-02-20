let recognition;
let isListening = false;

// Function to start live translation
function startLiveTranslation() {
    if (isListening) return;
    isListening = true;

    const sourceLang = document.getElementById("sourceLang").value;
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = sourceLang;
    recognition.continuous = true; // Keep listening

    recognition.onresult = async (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        document.getElementById('inputText').value = transcript;

        // Auto-translate and speak
        await translateText(transcript);
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        alert("Speech recognition error: " + event.error);
        stopLiveTranslation();
    };

    recognition.start();
}

// Function to stop live translation
function stopLiveTranslation() {
    if (recognition) {
        recognition.stop();
        isListening = false;
    }
}

// Function to translate text
async function translateText(text) {
    const sourceLang = document.getElementById("sourceLang").value;
    const targetLang = document.getElementById("targetLang").value;

    if (!text) return;

    try {
        const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const translatedText = data.responseData.translatedText;

        document.getElementById('translatedText').innerText = translatedText;
        speakText(translatedText, targetLang);
    } catch (error) {
        console.error("Error translating text:", error);
        alert("Error translating text. Please check your network or try again later.");
    }
}

// Function to speak translated text
function speakText(text = null, lang = null) {
    const translatedText = text || document.getElementById('translatedText').innerText;
    const targetLang = lang || document.getElementById("targetLang").value;

    if (!translatedText) {
        alert("No translated text to speak.");
        return;
    }

    const speech = new SpeechSynthesisUtterance(translatedText);
    speech.lang = targetLang;
    window.speechSynthesis.speak(speech);
}
