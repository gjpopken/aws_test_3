const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({storage: storage})

/**
 * GET route template
 */
router.get('/', (req, res) => {
  // GET route code here
});

/**
 * POST route template
 */
router.post('/', upload.single('file'), (req, res) => {
    console.log(req.file);
    res.sendStatus(201)
});

module.exports = router;