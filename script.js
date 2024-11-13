async function generateImage() {
    const name = document.getElementById('nameInput').value || 'Yourname';
    const character = document.getElementById('characterSelect').value;
    const generateButton = document.querySelector('button');

    // Update button to show loading state
    generateButton.textContent = "Loading...";
    generateButton.disabled = true;

    const prompt = `3D animation, a ${character} holding a cake named "${name}", attractive scenery in the background.`;
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

// New function to display the image and handle download
function displayImage(url) {
    // Display the generated image
    const imageContainer = document.getElementById('imageContainer');
    imageContainer.innerHTML = `<img src="${url}" alt="Generated Image" id="generatedImage">`;

    // Update the download button and show it
    const downloadButton = document.getElementById('downloadButton');
    downloadButton.href = url;
    downloadButton.style.display = 'inline-block';

    // Fallback for browsers that don’t support `download` attribute
    downloadButton.onclick = function(event) {
        // Check if the browser supports the download attribute
        if (!downloadButton.download) {
            event.preventDefault(); // Prevent default link action
            window.open(url, '_blank'); // Open image in a new tab
        }
    };
}
