/**
 * Minimal AWS S3 presigned PUT URL generator.
 * Uses only Node.js built-in `crypto` — no AWS SDK needed.
 */
import { createHmac, createHash } from "crypto";

interface PresignOptions {
  bucket: string;
  region: string;
  accessKey: string;
  secretKey: string;
  endpoint?: string; // custom endpoint for R2/MinIO
  key: string; // S3 object key (path)
  mimeType: string;
  expiresIn?: number; // seconds, default 3600
}

function hmac(key: Buffer | string, data: string) {
  return createHmac("sha256", key).update(data).digest();
}

function sha256hex(data: string) {
  return createHash("sha256").update(data).digest("hex");
}

function isoDate(d: Date) {
  return d.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z";
}

function shortDate(d: Date) {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

export function presignPut(opts: PresignOptions): string {
  const {
    bucket,
    region,
    accessKey,
    secretKey,
    key,
    mimeType,
    expiresIn = 3600,
  } = opts;

  const now = new Date();
  const datestamp = shortDate(now);
  const amzdate = isoDate(now);

  const host = opts.endpoint
    ? new URL(opts.endpoint).host
    : `${bucket}.s3.${region}.amazonaws.com`;

  const credentialScope = `${datestamp}/${region}/s3/aws4_request`;
  const credential = `${accessKey}/${credentialScope}`;

  const encodedKey = key.split("/").map(encodeURIComponent).join("/");

  const queryParams = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": credential,
    "X-Amz-Date": amzdate,
    "X-Amz-Expires": String(expiresIn),
    "X-Amz-SignedHeaders": "content-type;host",
  });

  const canonicalQueryString = queryParams.toString();

  const canonicalHeaders = `content-type:${mimeType}\nhost:${host}\n`;
  const signedHeaders = "content-type;host";

  const canonicalRequest = [
    "PUT",
    `/${opts.endpoint ? `${bucket}/` : ""}${encodedKey}`,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzdate,
    credentialScope,
    sha256hex(canonicalRequest),
  ].join("\n");

  const signingKey = hmac(
    hmac(hmac(hmac(Buffer.from(`AWS4${secretKey}`), datestamp), region), "s3"),
    "aws4_request",
  );

  const signature = createHmac("sha256", signingKey)
    .update(stringToSign)
    .digest("hex");

  const base = opts.endpoint
    ? `${opts.endpoint}/${bucket}/${encodedKey}`
    : `https://${host}/${encodedKey}`;

  return `${base}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

export function isS3Configured() {
  return !!(
    process.env.S3_BUCKET &&
    process.env.S3_REGION &&
    process.env.S3_ACCESS_KEY &&
    process.env.S3_SECRET_KEY
  );
}

export function s3PublicUrl(key: string) {
  const bucket = process.env.S3_BUCKET!;
  const region = process.env.S3_REGION!;
  const endpoint = process.env.S3_ENDPOINT;
  if (endpoint) return `${endpoint}/${bucket}/${key}`;
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
