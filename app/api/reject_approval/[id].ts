// pages/api/reject_upload/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import  prisma  from '../../../lib/prisma';
import nodemailer from 'nodemailer';

const rejectUpload = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  try {
    // Get the upload record
    const upload = await prisma.userUploads.findUnique({
      where: { id: Number(id) },
      include: {
        policyHolder: true, // Include related policyholder info for email
      },
    });

    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    // Send email to the policyholder
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Replace with your email
        pass: process.env.EMAIL_PASS, // Replace with your email password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: upload.policyHolder.email,
      subject: 'Application Rejected',
      text: `Dear ${upload.policyHolder.full_name}, your application has been rejected.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Application rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting upload', error });
  }
};

export default rejectUpload;
