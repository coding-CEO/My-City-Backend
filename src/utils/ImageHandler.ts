import { v2 as cloudinary } from "cloudinary";

export class ImageHandler {
  public static imageUploadAndGetPublicUrl = (
    imgLocalPath: string
  ): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        let result = await cloudinary.uploader.upload(imgLocalPath);
        return resolve(result.secure_url);
      } catch (error) {
        return reject(error);
      }
    });
  };
}
