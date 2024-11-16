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

// Function to display the image and handle download
function displayImage(url) {
    // Display the generated image
    const imageContainer = document.getElementById('imageContainer');
    imageContainer.innerHTML = `<img src="${url}" alt="Generated Image" id="generatedImage">`;

    // Update the download button and show it
    const downloadButton = document.getElementById('downloadButton');
    downloadButton.style.display = 'inline-block';

    // Force download on button click
    downloadButton.onclick = async function(event) {
        event.preventDefault(); // Prevent default behavior

        try {
            // Fetch the image as a Blob
            const response = await fetch(url);
            const blob = await response.blob();

            // Create a temporary URL for the Blob
            const blobUrl = URL.createObjectURL(blob);

            // Create a hidden link element
            const tempLink = document.createElement('a');
            tempLink.href = blobUrl;
            tempLink.download = 'your_name_on_cake.png'; // Filename for the downloaded file

            // Trigger the download
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);

            // Revoke the temporary URL to free memory
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);

            // Fallback for unsupported browsers
            const userChoice = confirm("Your browser does not fully support downloads. Would you like to open the image in an external browser?");
            if (userChoice) {
                window.open(url, '_blank');
            } else {
                navigator.clipboard.writeText(url).then(() => {
                    alert("Image link copied to clipboard! You can paste it in a browser to download.");
                }).catch(err => {
                    console.error("Failed to copy link to clipboard: ", err);
                    alert("Could not copy the link. Please try manually opening the image.");
                });
            }
        }
    };
}
