// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

// --- Middleware ---
app.use(express.json()); // To parse JSON bodies
app.use((req, res, next) => {
    // Allows any frontend domain to make requests to this backend.
    // For production, replace '*' with your actual domain (e.g., 'https://isaactestimony.com').
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// --- Nodemailer Transporter Setup ---
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
    }
});

// --- API Endpoint: POST /send-email ---
app.post('/send-email', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ status: 'error', message: 'All fields are required.' });
    }

    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.RECEIVING_EMAIL,
        subject: `New Portfolio Message from ${name}`,
        html: `
            <h3>Contact Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <hr>
            <h3>Message:</h3>
            <p>${message}</p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Nodemailer Error:', error);
            return res.status(500).json({ 
                status: 'error', 
                message: 'Failed to send message. Please check server logs.' 
            });
        }

        console.log('Message sent: %s', info.messageId);
        res.json({ 
            status: 'success', 
            message: 'Your message has been sent successfully!' 
        });
    });
});

// --- Start the Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access the server at http://localhost:${PORT}`);
});