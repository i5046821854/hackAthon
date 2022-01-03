var express = require('express');
var router = express.Router();
const db = require('./db')

//인덱스 페이지
router.get('', (req, res) => {
    res.redirect("/main")
})

//메인 페이지(get)
router.get('/main', (req, res) => {
    res.render('main.ejs', {
        login: (req.session.user ? true : false)
    })
})

module.exports = router;