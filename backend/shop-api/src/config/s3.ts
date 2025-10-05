import { S3Client } from "@aws-sdk/client-s3";

export function createS3Client(): S3Client {
    const endpoint = process.env.S3_ENDPOINT || "";
    const region = process.env.S3_REGION || "auto";
    const accessKeyId = process.env.S3_ACCESS_KEY_ID || "";
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || "";

    if (!endpoint || !accessKeyId || !secretAccessKey) {
        throw new Error("S3 credentials not set");
    }

    return new S3Client({
        region,
        endpoint,
        forcePathStyle: true,
        credentials: { accessKeyId, secretAccessKey },
    });
}

export function isS3Enabled(): boolean {
    return Boolean(process.env.S3_BUCKET && process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY);
}


