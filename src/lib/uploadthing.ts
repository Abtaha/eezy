import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";

import type { EEZYFileRouter } from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<EEZYFileRouter>();
export const UploadDropzone = generateUploadDropzone<EEZYFileRouter>();

export const { useUploadThing } = generateReactHelpers<EEZYFileRouter>();
