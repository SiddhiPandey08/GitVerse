import { s3, S3_BUCKET } from "./config/aws-config.js";

console.log("Bucket:", S3_BUCKET);
console.log("Endpoint:", process.env.S3_ENDPOINT);

s3.putObject(
  {
    Bucket: S3_BUCKET,
    Key: "test.txt",
    Body: "Hello from MinIO!",
  },
  (err, data) => {
    if (err) {
      console.log("❌ Upload failed:", JSON.stringify(err, null, 2));
    } else {
      console.log("✅ Upload successful!", data);
    }
  },
);
