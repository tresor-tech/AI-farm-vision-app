const URL = "https://teachablemachine.withgoogle.com/models/_J-QmGaOP/";
let model, labelContainer, maxPredictions;
let currentLanguage = 'en'; // Start with English

const textContent = {
    en: {
        heading: "Welcome to our AI-powered feature Farm Vision",
        subheading: "Try out our new farm vision AI model. This feature allows you to check whether your crops are healthy or not. Click choose a file or snap a picture of the crop in your farm, wait a bit, and you will receive the response.",
        note: "For now, try out cabbages.",
        switchToFrench: "Switch to French",
        resultHealthy: "Healthy",
        resultUnhealthy: "Unhealthy"
    },
    fr: {
        heading: "Bienvenue dans notre fonctionnalité Farm Vision alimentée par l'IA",
        subheading: "Essayez notre nouveau modèle d'IA farm vision. Cette fonctionnalité vous permet de vérifier si vos cultures sont en bonne santé ou non. Cliquez sur choisir un fichier ou prenez une photo de la culture dans votre ferme, attendez un peu, et vous recevrez la réponse.",
        note: "Pour l'instant, essayez avec des choux.",
        switchToFrench: "Passer à l'anglais",
        resultHealthy: "Sain",
        resultUnhealthy: "Malsain"
    }
};

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        const div = document.createElement("div");
        div.classList.add("label");
        div.id = "label-" + i;
        labelContainer.appendChild(div);
    }
}

init();

// Update language content on the webpage
function updateLanguage() {
    const content = textContent[currentLanguage];
    document.getElementById("heading").innerText = content.heading;
    document.getElementById("subheading").innerText = content.subheading;
    document.querySelector(".note").innerText = content.note;
    document.getElementById("languageButton").innerText = content.switchToFrench;
}

// Toggle between English and French
document.getElementById("languageButton").addEventListener("click", () => {
    currentLanguage = currentLanguage === 'en' ? 'fr' : 'en';
    updateLanguage();
});

document.getElementById('imageUpload').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function(event) {
            const imgElement = document.getElementById('uploadedImage');
            imgElement.src = event.target.result;
            imgElement.style.display = 'block';
            
            imgElement.onload = async function() {
                const prediction = await model.predict(imgElement);
                displayPrediction(prediction);
            };
        };
        reader.readAsDataURL(file);
    }
});

function displayPrediction(predictions) {
    predictions.forEach((prediction, index) => {
        const labelElement = document.getElementById("label-" + index);
        if (labelElement) {
            labelElement.innerHTML = `${prediction.className}: ${prediction.probability.toFixed(2)}`;
        }
    });

    const unhealthyPrediction = predictions.find(pred => pred.className === 'Bad');
    const healthyPrediction = predictions.find(pred => pred.className === 'Good');

    const content = textContent[currentLanguage];

    if (unhealthyPrediction && healthyPrediction) {
        if (unhealthyPrediction.probability > healthyPrediction.probability) {
            document.getElementById('result').innerText = content.resultUnhealthy;
            document.getElementById('result').className = 'unhealthy';
        } else {
            document.getElementById('result').innerText = content.resultHealthy;
            document.getElementById('result').className = 'healthy';
        }
    } else {
        document.getElementById('result').innerText = 'Unable to determine result';
        document.getElementById('result').className = '';
    }
}

// Initialize page in English
updateLanguage();
