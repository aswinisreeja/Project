
const PDFDocument = require('pdfkit');
const fs = require('fs');

function generatePdf(expenses, filePath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(16).text('Expense Summary', { align: 'center' });
    doc.moveDown();

    expenses.forEach(expense => {
      doc
        .fontSize(12)
        .text(`Amount: ${expense.amount}`, { continued: true })
        .text(` | Category: ${expense.category}`, { continued: true })
        .text(` | Date: ${expense.date}`, { continued: true })
        .text(` | Description: ${expense.description}`)
        .moveDown();
    });

    doc.end();

    doc.on('end', () => resolve(filePath));
    doc.on('error', reject);
  });
}

module.exports = generatePdf;
