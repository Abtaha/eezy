import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { auth } from "@/server/auth";

import { headers } from "next/headers";

const f = createUploadthing();

const isAuthenticated = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) return null;
  return session.user;
};

export const eezyFileRouter = {
  productImageUploader: f({
    image: {
      maxFileSize: "16MB",
      maxFileCount: 1,
      minFileCount: 1,
    },
  })
    .middleware(async () => {
      const user = await isAuthenticated();

      if (!user || user.role !== "productManager") {
        throw new UploadThingError("Unauthorized");
      }

      return { userId: user?.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);

      return { url: file.ufsUrl };
    }),

  chatMediaUploader: f({
    blob: {
      maxFileSize: "16MB",
      maxFileCount: 5,
      minFileCount: 1,
    },
  }).onUploadComplete(async ({ file }) => {
    console.log("Upload complete");
    console.log("file url", file.ufsUrl);

    return { url: file.ufsUrl };
  }),
} satisfies FileRouter;

export type EEZYFileRouter = typeof eezyFileRouter;
