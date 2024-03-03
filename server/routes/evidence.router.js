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
const signer = require('@aws-sdk/s3-request-presigner')

// ! References for AWS S3 Bucket
// https://www.youtube.com/watch?v=eQAIojcArRY&t=354s

//  All of this information comes from the AWS site for S3 buckets
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

router.get('/', async (req, res) => {
    // GET route code here
    const queryText = `
    SELECT * FROM "evidence";
    `
    pool.query(queryText)
        .then(async result => {
            for (e of result.rows) {
                // For each piece of evidence, I need to create a new
                // GetObject command, which specifies the bucket I want to go into,
                // as well as the specific file I want to get (the Key)
                const command = new aws.GetObjectCommand({
                    Bucket: bucketName,
                    Key: e.file_url,
                })
                // the getSignedUrl method will send a unique and temporary URL that references the 
                // specific image.
                const url = await signer.getSignedUrl(s3, command, { expiresIn: 3600 })

                // I assign that AWS url to a new key, aws_url, in the specific evidence obj.
                e.aws_url = url
            }

            res.send(result.rows)
        }).catch(err => {
            console.log('GET error with Pool: ', err);
            res.sendStatus(500)
        })
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

        const queryText = `
        INSERT INTO "evidence" ("title", "notes", "file_url", "user_id", "media_type")
        VALUES ($1, $2, $3, $4, $5);
        `
        const queryParams = [req.body.title, req.body.notes, req.file.originalname, req.body.user_id, req.file.mimetype]
        pool.query(queryText, queryParams)
            .then(result => {
                res.sendStatus(201)
            }).catch(err => {
                console.log("Error with Pool:", err);
                res.sendStatus(500)
            })

    } catch (error) {
        console.log('Here is the error from AWS: ', error);
        res.sendStatus(500)
    }

});

router.put('/:id', upload.single('file'), async (req, res) => {
    const connection = await pool.connect()
    if (req.file) {
        console.log(req.file);
        try {
            await connection.query("BEGIN")

            // I'm putting the pool query first so that if the AWS upload fails,
            // the UPDATE can still be rolled back.
            const queryText = `
            UPDATE "evidence" 
            SET "title" = $1,
            "notes" = $2,
            "media_type" = $3 
            WHERE "id" = $4; 
            `
            const queryParams = [req.body.title, req.body.notes, req.file.mimetype, req.params.id]
            await connection.query(queryText, queryParams)

            // We need the original name that the image was uploaded to AWS with
            // so it knows which to replace.
            const result = await connection.query(`SELECT "file_url" FROM "evidence" WHERE "id" = $1;`, [req.params.id])
            const aws_reference = result.rows[0].file_url
            console.log(aws_reference);

            const params = {
                Bucket: bucketName,
                // referencing the original upload Key
                Key: aws_reference,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            }
            const command = new aws.PutObjectCommand(params)
            await s3.send(command)
            await connection.query("COMMIT")
            res.sendStatus(201)
        } catch (error) {
            await connection.query("ROLLBACK")
            console.log(error);
            res.sendStatus(500)
        } finally {
            connection.release()
        }
    } else {

    }
})

module.exports = router;