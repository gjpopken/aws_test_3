const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const dotenv = require('dotenv')
dotenv.config()
// Requiring in the AWS functionality.
const aws = require('@aws-sdk/client-s3')

// ! References for AWS S3 Bucket
//  All of this informatio comes from the AWS site for S3 buckets
// and IAM for the user I create that represents this app.
const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

// Creates a new instance of the S3Client class, granting us access to 
// the S3 bucket I created.
const s3 = new aws.S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion,

})
/**
 * GET route template
 */
router.get('/', (req, res) => {
    // GET route code here
});

// --------------upload.single is the multer middleware
router.post('/', upload.single('file'), async (req, res) => {
    console.log(req.file);

    // The keys Bucket, Key, Body, and ContentType all keys AWS needs
    // to help identify and store the file.
    const params = {
        Bucket: bucketName,
        // If the Key already exists in the bucket, the PutCommand will replace
        // the content, not add a new object with the same Key.
        Key: req.file.originalname,
        // req.file.buffer is the actual image.
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
    }

    // This command is a new instance of a PutObject command,
    // which takes the params we just defined. 
    // We need a new command each time we interact with the 
    // bucket.
    const command = new aws.PutObjectCommand(params)
    try {
        // sending the command to AWS
        await s3.send(command)
        res.sendStatus(201)
    } catch (error) {
        console.log('Here is the error: ', error);
        res.sendStatus(500)
    }

});

module.exports = router;