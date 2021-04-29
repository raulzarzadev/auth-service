import mainHtmlContent from '../EMAIL\'S/mainHtmlContent'

const nodemailer = require('nodemailer')
const user = process.env.EMAIL_USER
const pass = process.env.EMAIL_PASSWORD

export default async ({ to, subject, text, link, title }) => {
  // Generate test SMTP service account from ethereal.email

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
      user,
      pass
    }
  })

  transporter.verify(function (error, success) {
    if (error) {
      console.log(error)
    } else {
      console.log('Server is ready to take our messages')
    }
  })

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `auth-services RZ ${user}`, // sender address
    to, // list of receivers
    subject, // Subject line
    text, // html text
    html: mainHtmlContent(title, link) // html body
  })
  console.log('Message sent: %s', info)
}
