import { NextResponse } from 'next/server'
import { getContactEmailTemplate } from '@/lib/emailTemplate'

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json()

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('RESEND_API_KEY is missing')
      return NextResponse.json(
        { success: false, message: 'Email sending configuration error' },
        { status: 500 }
      )
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const toEmail = process.env.CONTACT_RECEIVER_EMAIL || '5065sid@gmail.com'

    // Send email using Resend REST API (perfect for V8/Edge environments)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toEmail,
        reply_to: email,
        subject: `New Contact Form: ${subject}`,
        html: getContactEmailTemplate({ name, email, subject, message }),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Resend API Error:', errorData)
      return NextResponse.json(
        { success: false, message: 'Failed to send email via Resend API', error: errorData },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    console.error('Email API Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send email', error: error.message },
      { status: 500 }
    )
  }
}
