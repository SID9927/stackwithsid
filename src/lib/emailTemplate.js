export const getContactEmailTemplate = ({ name, email, subject, message }) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Syne:wght@800&display=swap');
          
          body { 
            font-family: 'Inter', -apple-system, sans-serif; 
            line-height: 1.6; 
            color: #ffffff; 
            margin: 0; 
            padding: 0; 
            background-color: #0a0118; 
          }
          
          .wrapper {
            background-color: #0a0118;
            padding: 30px 15px;
          }

          .container { 
            max-width: 550px; 
            margin: 0 auto; 
            background: #120526; 
            border-radius: 24px; 
            overflow: hidden; 
            border: 1px solid rgba(168, 85, 247, 0.2);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          }

          .header { 
            background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); 
            padding: 32px 24px; 
            text-align: center; 
          }

          /* CUSTOM CSS LOGO (The Stack) */
          .logo-container {
            width: 48px;
            height: 48px;
            margin: 0 auto 16px;
            position: relative;
          }
          .stack-layer {
            width: 32px;
            height: 18px;
            border: 2px solid #ffffff;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.1);
            position: absolute;
            left: 50%;
            transform: translateX(-50%) skew(-10deg);
          }
          .layer-1 { top: 0; z-index: 3; }
          .layer-2 { top: 8px; z-index: 2; opacity: 0.7; }
          .layer-3 { top: 16px; z-index: 1; opacity: 0.4; }

          .header h1 { 
            margin: 0; 
            font-family: 'Syne', sans-serif;
            font-size: 22px; 
            font-weight: 800; 
            letter-spacing: -0.02em; 
            color: #ffffff;
            text-transform: uppercase;
          }

          .content { padding: 40px 32px; }
          
          .info-card {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 18px;
            padding: 24px;
            margin-bottom: 24px;
            border: 1px solid rgba(255, 255, 255, 0.05);
          }

          .label { 
            font-size: 10px; 
            font-weight: 800; 
            text-transform: uppercase; 
            color: #a855f7; 
            letter-spacing: 0.1em; 
            margin-bottom: 8px; 
          }

          .value { 
            font-size: 16px; 
            font-weight: 600; 
            color: #f8fafc; 
            margin-bottom: 20px;
          }

          .message-box { 
            background: rgba(0, 0, 0, 0.2); 
            padding: 20px; 
            border-radius: 16px; 
            border: 1px solid rgba(168, 85, 247, 0.1);
            color: #cbd5e1;
            font-size: 15px;
            line-height: 1.7;
          }

          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.2), transparent);
            margin: 32px 0;
          }

          .footer { 
            padding: 0 32px 40px; 
            text-align: center; 
          }

          .footer p { 
            font-size: 12px; 
            color: #64748b; 
            margin: 0 0 12px; 
          }

          .btn {
            display: inline-block;
            color: #a855f7;
            text-decoration: none;
            font-weight: 700;
            font-size: 13px;
            letter-spacing: 0.02em;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="logo-container">
                <div class="stack-layer layer-1"></div>
                <div class="stack-layer layer-2"></div>
                <div class="stack-layer layer-3"></div>
              </div>
              <h1>Mail Alert</h1>
            </div>
            
            <div class="content">
              <div class="info-card">
                <div class="label">From</div>
                <div class="value" style="margin-bottom: 0;">
                  ${name} <br/>
                  <span style="font-size: 13px; font-weight: 400; color: #94a3b8;">${email}</span>
                </div>
              </div>

              <div class="label">Subject</div>
              <div class="value">${subject}</div>

              <div class="label">Message</div>
              <div class="message-box">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>

            <div class="footer">
              <div class="divider"></div>
              <p>Sent from your website</p>
              <a href="https://stack.dsiddharth.in" class="btn">stack.dsiddharth.in</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}
