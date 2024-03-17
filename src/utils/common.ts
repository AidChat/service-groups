import {v2 as cloudinary} from 'cloudinary';

export function isValidEmail({email}: { email: string }) {
    // Regular expression for a basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Test the email against the regex
    return emailRegex.test(email);
}


export function imageUpload(data: string, name: string, onDone: (data: any) => void) {
    cloudinary.uploader.upload(data, {
        public_id: name, folder: 'aidchat'
    }, function (error: any, result: any) {
        onDone(result)
    });
}
