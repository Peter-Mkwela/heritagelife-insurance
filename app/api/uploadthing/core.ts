// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

export const ourFileRouter = {
  policyholderUpload: f({ 
    image: { maxFileSize: '4MB' }, 
    pdf: { maxFileSize: '4MB' } 
  }).onUploadComplete(async ({ file }) => {
    console.log('Upload complete:', file.url);
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
