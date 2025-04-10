// utils/s3Upload.js;
import dotenv from "dotenv";  
dotenv.config();
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Create an instance of S3
const s3 = new AWS.S3();

/**
 * Upload a document to AWS S3
 * @param {Object} file - File object (should come from multer)
 * @param {string} folder - Folder name in your bucket
 * @returns {Promise<string>} - URL of uploaded file
 */
export const uploadToS3 = async (file, folder = "uploads") => {
  const fileExtension = path.extname(file.originalname);
  const fileKey = `${folder}/${uuidv4()}${fileExtension}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
    // ACL: "public-read", // To make the file publicly accessible
  };

  const uploadResult = await s3.upload(params).promise();
  return uploadResult.Location; // This is the public URL
};

export const deleteFromS3 = async (url) => {
  // Create a URL object from the provided URL
  const urlObj = new URL(url);
  // The pathname will be something like "/documents/xxx.pdf"
  // Remove the leading slash to get the key
  const key = urlObj.pathname.substring(1);

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  };

  return s3.deleteObject(params).promise();
};
