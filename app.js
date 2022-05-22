const express = require('express')
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
const path = require('path')
const nodemailer = require('nodemailer')

const app = express()
const port = 3000

//View Engine Setup
app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')

//Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Static Folder
app.use('/public', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.render('contact', { layout: false })
})

app.post('/send', (req, res) => {
  // console.log(req.body)
  const output = `
  <p>You have a new contact request</p>
  <h3>Contact Details:</h3>
  <ul>
    <li>Name: ${req.body.name}</li>
    <li>Company: ${req.body.company}</li>
    <li>Email: ${req.body.email}</li>
    <li>Phone: ${req.body.phone}</li>
  </ul>
  <h3>Message</h3>
  <p>${req.body.message}</p>
  `
  // async..await is not allowed in global scope, must use a wrapper
  async function main() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL, // generated ethereal user
        pass: process.env.WORD, // generated ethereal password
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Customer Contact" <contact@plamarusa.com>', // sender address
      to: 'affiliate.aldrin@gmail.com', // list of receivers
      subject: 'New Customer Contact - Plamar Site', // Subject line
      text: 'New Customer Contact Form', // plain text body
      html: output, // html body
    })

    console.log('Message sent: %s', info.messageId)
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))

    res.render('contact', { layout: false })
  }
  main().catch(console.error)
})

app.listen(port, () => console.log(`Connected to server via port ${port}`))
