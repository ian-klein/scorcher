//email the scores to the admin user

'use strict';

import { revive } from '../functionsUtil.mjs';
const nodemailer = require('nodemailer');

export default async function emailScores(request, context) {
    const body = await request.json();
    revive(body);

    const toEmail = body.player.email;
    const transportConfig = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      }
    };

    console.log(transportConfig);
    const transporter = nodemailer.createTransport(transportConfig);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'Scores for ' + body.competition.name,
      text: 'Scores for ' + body.competition.name
    };
    console.log(mailOptions);

    await transporter.sendMail(mailOptions);

    //Send the response
    const rbody = {
        status: 'OK',
    };
    const response = new Response(JSON.stringify(rbody), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(rbody).length
        }
    });
    
    return response;


}