const pdfUrl = 'test_pdf.pdf';
let pdfDoc = null;
let pageNum = 1;
let role = 'viewer';

const socket = new WebSocket('ws://localhost:3000');
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');
const pageNumberDisplay = document.getElementById('page-number');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

// Load PDF
pdfjsLib.getDocument(pdfUrl).promise.then((pdf) => {
  pdfDoc = pdf;
  renderPage(pageNum);
});

// Render page
function renderPage(num) {
  pdfDoc.getPage(num).then((page) => {
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    page.render({ canvasContext: ctx, viewport: viewport });
    pageNumberDisplay.textContent = `Page ${num} / ${pdfDoc.numPages}`;
    pageNum = num;
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
  socket.send(JSON.stringify({ type: 'changePage', page: num }));
}

// WebSocket events
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.role) {
    role = data.role;
    prevBtn.disabled = role !== 'admin';
    nextBtn.disabled = role !== 'admin';
  }

  if (data.type === 'pageUpdate') {
    renderPage(data.page);
  }
};
