const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({storage: storage})
const dotenv = require('dotenv')
dotenv.config()
const aws = require('@aws-sdk/client-s3')

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3 = new aws.S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  }
}) 
/**
 * GET route template
 */
router.get('/', (req, res) => {
  // GET route code here
});

/**
 * POST route template
 */
router.post('/', upload.single('file'), async (req, res) => {
    console.log(req.file);

    const params = {
        Bucket: bucketName,
        Key: req.file.originalname,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
    }
    const command = new aws.PutObjectCommand(params)
    await s3.send(command)

    res.sendStatus(201)
});

module.exports = router;