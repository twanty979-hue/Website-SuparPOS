const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

async function upload() {
  const filePath = path.resolve('C:\\Users\\Por Woodden\\Desktop\\SuparPOS-Setup.exe');
  if (!fs.existsSync(filePath)) {
    console.error('Setup file not found at:', filePath);
    process.exit(1);
  }

  const fileStream = fs.createReadStream(filePath);
  const fileSize = fs.statSync(filePath).size;
  console.log(`Uploading ${filePath} (${(fileSize / 1024 / 1024).toFixed(2)} MB) to Cloudflare R2...`);

  const client = new S3Client({
    region: 'auto',
    endpoint: 'https://d9e78a2733b29316b2848d6c87e60baa.r2.cloudflarestorage.com',
    credentials: {
      accessKeyId: '63111b6ed08ec8ca6d4770bde79087e9',
      secretAccessKey: '9270fbd14f40a04b15720ec1af68472c2a3fbdf2d4b23fb552c3e40d8e6ae82f'
    }
  });

  const cmd = new PutObjectCommand({
    Bucket: 'foodscan-images',
    Key: 'downloads/SuparPOS-Setup.exe',
    Body: fileStream,
    ContentType: 'application/vnd.microsoft.portable-executable',
    ContentLength: fileSize
  });

  await client.send(cmd);
  console.log('Successfully uploaded SuparPOS-Setup.exe to Cloudflare R2!');
  console.log('Public URL: https://img.pos-foodscan.com/downloads/SuparPOS-Setup.exe');
}

upload().catch(err => {
  console.error('Upload failed:', err);
  process.exit(1);
});
