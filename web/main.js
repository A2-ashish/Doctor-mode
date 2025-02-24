import { streamGemini } from './gemini-api.js';

const realFileBtn = document.getElementById("real-file");
const customBtn = document.getElementById("custom-button");
const customTxt = document.getElementById("custom-text");
const imagePreviews = document.getElementById('image-previews'); // Get the preview container

customBtn.addEventListener("click", function() {
  realFileBtn.click();
});

realFileBtn.addEventListener("change", function() {
  if (realFileBtn.files.length > 0) {
    const file = realFileBtn.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const imageUrl = e.target.result;

      imagePreviews.innerHTML = ''; // Clear previous previews

      const img = document.createElement('img');
      img.src = imageUrl;
      img.classList.add('image-preview');
      imagePreviews.appendChild(img);

      customTxt.textContent = file.name;
    };

    reader.readAsDataURL(file);
  } else {
    customTxt.textContent = 'No file chosen';
    imagePreviews.innerHTML = '';
  }
});

let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let output = document.querySelector('.output');

form.onsubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = 'Reading...';

  try {
    if (realFileBtn.files.length === 0) {
      alert("Please select an image first.");
      return;
    }

    const file = realFileBtn.files[0];
    const reader = new FileReader();

    reader.onloadend = async () => { // Use onloadend to ensure file is read
      const imageBase64 = reader.result.split(',')[1]; // Extract base64 part

      let contents = [
        {
          role: 'user',
          parts: [
            { inline_data: { mime_type: file.type, data: imageBase64 } }, // Use file.type
            { text: promptInput.value }
          ]
        }
      ];

      let stream = streamGemini({
        model: 'gemini-1.5-flash', // or gemini-1.5-pro
        contents,
      });

      let buffer = [];
      let md = new markdownit();
      for await (let chunk of stream) {
        buffer.push(chunk);
        output.innerHTML = md.render(buffer.join(''));
      }
    };

    reader.readAsDataURL(file); // Start reading the file
  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};