const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

// user => email,name,.. ; url => for something like reset password link
// new Email(user,url)
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.from = `Mohammed Raza <razavittesting123@gmail.com>`;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
  }

  createTransport() {
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'RazaVITtesting123@gmail.com',
        pass: 'bqbe sfkj grlz iwjm',
      },
    });
  }

  // send the actual email
  async send(template, subject) {
    // 1) Render Html based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) Define the mail option
    const mailOptions = {
      from: 'RazaVITtesting123@gmail.com',
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };
    // 3) create a transport and send email
    await this.createTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the natours family');
  }
  async sendResetPassword() {
    await this.send(
      'resetPassword',
      'Password Recovery from natours (valid for 10 minute only)'
    );
  }
};
