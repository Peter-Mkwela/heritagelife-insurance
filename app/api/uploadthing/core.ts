import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

export const ourFileRouter = {
  // Existing application upload for policyholder registration
  policyholderUpload: f({
    image: { maxFileSize: '4MB' },
    pdf: { maxFileSize: '4MB' },
  }).onUploadComplete(async ({ file }) => {
    console.log('Policyholder application uploaded:', file.url);
  }),

  // ✅ New endpoint for uploading claim files
  claimUpload: f({
    image: { maxFileSize: '4MB' },
    pdf: { maxFileSize: '4MB' },
  }).onUploadComplete(async ({ file }) => {
    console.log('Claim file uploaded:', file.url);
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
