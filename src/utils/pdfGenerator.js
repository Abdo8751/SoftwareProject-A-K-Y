const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  async generateTicket(booking) {
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `../../temp/ticket-${booking._id}.pdf`);
    
    // Generate QR code
    const qrCodeData = await QRCode.toDataURL(JSON.stringify({
      bookingId: booking._id,
      eventId: booking.event._id,
      userId: booking.user._id
    }));

    // Create PDF
    doc.pipe(fs.createWriteStream(filePath));

    // Add header
    doc.fontSize(25).text('Event Ticket', { align: 'center' });
    doc.moveDown();

    // Add event details
    doc.fontSize(15).text(`Event: ${booking.event.title}`);
    doc.fontSize(12).text(`Date: ${new Date(booking.event.date).toLocaleDateString()}`);
    doc.text(`Venue: ${booking.event.venue}`);
    doc.text(`Ticket Quantity: ${booking.ticketQuantity}`);
    doc.text(`Total Price: $${booking.totalPrice}`);
    doc.moveDown();

    // Add QR code
    doc.image(qrCodeData, {
      fit: [250, 250],
      align: 'center'
    });

    // Add footer
    doc.moveDown();
    doc.fontSize(10).text('This ticket is valid for one-time entry only.', { align: 'center' });
    doc.text('Please present this ticket at the venue.', { align: 'center' });

    // Finalize PDF
    doc.end();

    return filePath;
  }
}

module.exports = new PDFGenerator(); 