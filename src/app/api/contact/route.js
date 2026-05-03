import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getContactEmailTemplate } from '@/lib/emailTemplate'

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json()

    // 1. Setup Nodemailer Transporter (Gmail SMTP)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not normal password
      },
    })

    // 2. Setup Email Options
    const mailOptions = {
      from: `"${name}" <${process.env.GMAIL_USER}>`, // Gmail requires 'from' to be the authenticated user
      replyTo: email,
      to: process.env.CONTACT_RECEIVER_EMAIL || process.env.GMAIL_USER,
      subject: `New Contact Form: ${subject}`,
      html: getContactEmailTemplate({ name, email, subject, message }),
    }

    // 3. Send Email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    console.error('Email API Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send email', error: error.message },
      { status: 500 }
    )
  }
}
