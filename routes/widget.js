const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res, next) => {
	res.sendFile('index.html', { root: path.join(__dirname, '../../bubbletalk-widget/dist') });
});

module.exports = router;