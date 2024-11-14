let pdfDoc = null;
let pageNum = 1;
let role = 'viewer';
let renderTask = null;

const socket = new WebSocket('ws://localhost:3000');
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');
const pageNumberDisplay = document.getElementById('page-number');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const fileInput = document.getElementById('file-input');

// Handle PDF upload (only for admin)
fileInput.addEventListener('change', (event) => {
  if (role === 'admin') {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const pdfData = e.target.result;
        uploadPDF(pdfData);
      };
      fileReader.readAsDataURL(file); // Convert to base64 for server upload
    } else {
      alert('Please upload a valid PDF file.');
    }
  } else {
    alert('Only the admin can upload PDFs.');
  }
});

// Upload PDF to the server (admin)
function uploadPDF(pdfData) {
  fetch('/upload-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pdfData })
  }).then(response => {
    if (!response.ok) {
      console.error('Failed to upload PDF.');
    }
  });
}

// Load PDF from base64 data
function loadPDF(pdfData) {
  const loadingTask = pdfjsLib.getDocument({ data: atob(pdfData.split(',')[1]) });
  loadingTask.promise.then((pdf) => {
    pdfDoc = pdf;
    renderPage(pageNum);
  }).catch(error => {
    console.error("Error loading PDF:", error);
  });
}

// Render the specified page
function renderPage(num) {
  if (renderTask) renderTask.cancel(); // Cancel if a render task is ongoing

  pdfDoc.getPage(num).then((page) => {
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    renderTask = page.render({ canvasContext: ctx, viewport: viewport });
    renderTask.promise.then(() => {
      renderTask = null;
      pageNumberDisplay.textContent = `Page ${num} / ${pdfDoc.numPages}`;
      pageNum = num;
    }).catch((error) => {
      if (error.name !== 'RenderingCancelledException') {
        console.error('Render error:', error);
      }
    });
  });
}

// Handle navigation
prevBtn.addEventListener('click', () => {
  if (pageNum > 1 && role === 'admin') {
    changePage(pageNum - 1);
  }
});
nextBtn.addEventListener('click', () => {
  if (pageNum < pdfDoc.numPages && role === 'admin') {
    changePage(pageNum + 1);
  }
});

// Change page and broadcast if admin
function changePage(num) {
  pageNum = num;
  renderPage(num);
  if(role === 'admin') socket.send(JSON.stringify({ type: 'changePage', page: num }));
}

// WebSocket events
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.role) {
    role = data.role;
    prevBtn.disabled = role !== 'admin';
    nextBtn.disabled = role !== 'admin';
  }

  if (data.type === 'loadPDF' && data.pdfData) {
    loadPDF(data.pdfData);
    renderPage(data.page || 1);
  }

  if (data.type === 'pageUpdate') {
    renderPage(data.page);
  }
};
