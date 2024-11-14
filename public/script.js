const form = document.getElementById('upload-form');
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');
const prevButton = document.getElementById('prev-page');
const nextButton = document.getElementById('next-page');
const pageNumDisplay = document.getElementById('page-num');
const pageCountDisplay = document.getElementById('page-count');

let pdfDoc = null;
let pageNum = 1;
let totalPages = 0;

// Set up pdf.js worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

// Handle form submission for PDF upload
form.onsubmit = async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('pdf-upload');
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a PDF file.");
    return;
  }

  const formData = new FormData();
  formData.append('pdf', file);

  // Upload PDF to the server
  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  if (result.filePath) {
    loadPDF(result.filePath);
  } else {
    alert("Failed to upload PDF.");
  }
};

// Load and display the PDF
function loadPDF(url) {
  pdfjsLib.getDocument(url).promise.then((pdf) => {
    pdfDoc = pdf;
    totalPages = pdf.numPages;
    pageCountDisplay.textContent = totalPages;
    renderPage(pageNum);
  }).catch((error) => {
    console.error("Error loading PDF:", error);
  });
}

// Render a specific page of the PDF
function renderPage(num) {
  pdfDoc.getPage(num).then((page) => {
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render page into the canvas context
    const renderContext = { canvasContext: ctx, viewport: viewport };
    page.render(renderContext).then(() => {
      // Update page counters after rendering
      pageNumDisplay.textContent = num;
    });
  });
}

// Event listeners for slider controls
prevButton.addEventListener('click', () => {
  if (pageNum <= 1) return;
  pageNum--;
  renderPage(pageNum);
});

nextButton.addEventListener('click', () => {
  if (pageNum >= totalPages) return;
  pageNum++;
  renderPage(pageNum);
});
