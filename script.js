async function generateImage() {
    const name = document.getElementById('nameInput').value || 'Yourname';
    const character = document.getElementById('characterSelect').value;
    const generateButton = document.querySelector('button');

    // Update button to show loading state
    generateButton.textContent = "Loading...";
    generateButton.disabled = true;

    const prompt = `3D animation, a cute ${character} holding a cake named "${name}", attractive scenery in the background. ${name} name is a most important, party_hat, food, cake, candle, balloon, birthday_cake, outdoors, birthday hat, smile, day, confetti, water, grass, sky, reflection, blue_sky`;
    console.log("Generated Prompt:", prompt);

    const imageContainer = document.getElementById('imageContainer');
    imageContainer.innerHTML = '<p>Loading...</p>';

    const payload = [
        {
            "taskType": "imageInference",
            "model": "runware:100@1",
            "positivePrompt": prompt,
            "height": 512,
            "width": 512,
            "numberResults": 1,
            "outputType": ["dataURI", "URL"],
            "outputFormat": "PNG",
            "CFGScale": 7,
            "steps": 4,
            "scheduler": "Default",
            "includeCost": true,
            "taskUUID": "c3eb722f-5183-4401-a680-e0210edb4ede"
        }
    ];

    try {
        const response = await fetch('https://api.runware.ai/v1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 9l8PfKyT3gfAuGYu4CXXdzfqwiYLGkm5'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Full API Response:", data);

        if (Array.isArray(data.data) && data.data.length > 0) {
            const result = data.data[0];
            const imageUrl = result.imageURL;

            if (imageUrl) {
                displayImage(imageUrl);
            } else {
                imageContainer.innerHTML = `<p>Image data not found in the API response.</p>`;
            }
        } else {
            imageContainer.innerHTML = `<p>Unexpected response format. See console for details.</p>`;
        }
    } catch (error) {
        console.error("Error:", error);
        imageContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    } finally {
        // Revert button to original state after image loads
        generateButton.textContent = "Generate Image";
        generateButton.disabled = false;
    }
}

// Function to check if the user is in an in-app browser
function isInAppBrowser() {
    const userAgent = navigator.userAgent || navigator.vendor;
    return /Instagram|FBAN|FBAV|Twitter/i.test(userAgent);
}

// Function to display the image and handle download
function displayImage(url) {
    const imageContainer = document.getElementById('imageContainer');
    imageContainer.innerHTML = `<img src="${url}" alt="Generated Image" id="generatedImage">`;

    const downloadButton = document.getElementById('downloadButton');
    downloadButton.style.display = 'inline-block';

    downloadButton.onclick = async function(event) {
        event.preventDefault();

        if (isInAppBrowser()) {
            alert("Downloads are not supported in in-app browsers like Instagram. Please open this page in your device's default browser.");
            const externalBrowserButton = document.createElement('button');
            externalBrowserButton.textContent = 'Open in External Browser';
            externalBrowserButton.style.marginTop = '10px';
            externalBrowserButton.onclick = () => window.open(url, '_blank');
            imageContainer.appendChild(externalBrowserButton);
        } else {
            try {
                const response = await fetch(url);
                const blob = await response.blob();

                const blobUrl = URL.createObjectURL(blob);

                const tempLink = document.createElement('a');
                tempLink.href = blobUrl;
                tempLink.download = 'your_name_on_cake.png';

                document.body.appendChild(tempLink);
                tempLink.click();
                document.body.removeChild(tempLink);

                URL.revokeObjectURL(blobUrl);
            } catch (error) {
                console.error("Download failed:", error);
                window.open(url, '_blank');
            }
        }
    };
}
