import emailjs from '@emailjs/nodejs';

export function sendEmail({link, email}: { link: string, email: string }): Promise<any> {
    const templateParams = {
        link: link,
        email: email
    };
    const serviceID = process.env.MAIL_serviceID ? process.env.MAIL_serviceID : ''
    const templateID = process.env.MAIL_templateID ? process.env.MAIL_templateID : ''
    const pubK = process.env.MAIL_publicKey ? process.env.MAIL_publicKey : '';
    const privK = process.env.MAIN_privateKey ? process.env.MAIN_privateKey : ''
    return emailjs
        .send(serviceID, templateID, templateParams, {
            publicKey: pubK,
            privateKey: privK,
        })

}