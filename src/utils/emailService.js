const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail(to, subject, html) {
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendBookingConfirmation(booking) {
    const subject = `Booking Confirmation - ${booking.event.title}`;
    const html = `
      <h1>Booking Confirmation</h1>
      <p>Thank you for your booking!</p>
      <h2>Booking Details:</h2>
      <ul>
        <li>Event: ${booking.event.title}</li>
        <li>Date: ${new Date(booking.event.date).toLocaleDateString()}</li>
        <li>Tickets: ${booking.ticketQuantity}</li>
        <li>Total Price: $${booking.totalPrice}</li>
      </ul>
    `;

    return await this.sendEmail(booking.user.email, subject, html);
  }

  async sendBookingCancellation(booking) {
    const subject = `Booking Cancellation - ${booking.event.title}`;
    const html = `
      <h1>Booking Cancellation Confirmation</h1>
      <p>Your booking has been cancelled successfully.</p>
      <h2>Cancelled Booking Details:</h2>
      <ul>
        <li>Event: ${booking.event.title}</li>
        <li>Date: ${new Date(booking.event.date).toLocaleDateString()}</li>
        <li>Tickets: ${booking.ticketQuantity}</li>
        <li>Refund Amount: $${booking.totalPrice}</li>
      </ul>
    `;

    return await this.sendEmail(booking.user.email, subject, html);
  }

  async sendEventReminder(booking) {
    const subject = `Event Reminder - ${booking.event.title}`;
    const html = `
      <h1>Event Reminder</h1>
      <p>Your event is coming up soon!</p>
      <h2>Event Details:</h2>
      <ul>
        <li>Event: ${booking.event.title}</li>
        <li>Date: ${new Date(booking.event.date).toLocaleDateString()}</li>
        <li>Venue: ${booking.event.venue}</li>
        <li>Tickets: ${booking.ticketQuantity}</li>
      </ul>
    `;

    return await this.sendEmail(booking.user.email, subject, html);
  }
}

module.exports = new EmailService(); 