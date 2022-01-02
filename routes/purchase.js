var express = require('express');
var router = express.Router();
const db = require('./db')

//사용자 로그인 여부 미들웨어
const auth = function(req, res, next) {
    if (!req.session.user)
        res.send("<script>alert('로그인 후 이용가능합니다');window.location.href='/login';</script>")
    else
        next();
}


//공구 페이지 (get)
router.get('/purchase', (req, res) => {
    var sql = `select * from PURCHASE`
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.render('purchase.ejs', {
            login: islogin,
            dataArr: result
        })
    })
})

//공구 상세 페이지 (get)
router.get('/purchase_detail', (req, res) => {
    let sql = `select * from PURCHASE WHERE idx = ${req.query.idx};`
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        var user = '';
        if (req.session.user)
            user = req.session.user.id
        res.render('purchase_detail.ejs', {
            user,
            login: islogin,
            data: result[0]
        })
    })
})

//공구 마감 버튼 클릭 시
router.get('/close', (req, res) => {
    var sql = ''
    if (req.query.method == 'close')
        sql = `update PURCHASE set status = 2 WHERE idx = ${req.query.idx};`
    else
        sql = `update PURCHASE set status = 1 WHERE idx = ${req.query.idx};`
    let sql2 = `select * from PURCHASE WHERE idx = ${req.query.idx};`
    db.query(sql + sql2, async(err, result) => {
        if (err)
            console.log(err);
        var user = '';
        if (req.session.user)
            user = req.session.user.id
        res.render('purchase_detail.ejs', {
            user,
            login: islogin,
            data: result[1][0]
        })
    })
})


//공구 입력 페이지 (get)
router.get('/purchase_input', auth, (req, res) => {

    res.render('purchase_input.ejs', {
        login: islogin
    })
})

//공구 입력 페이지 (post)
router.post('/purchase_input', (req, res) => {
    var sql = `insert into PURCHASE (userid, title, description, prodName, prodIdx, location, max_number, form_link) values ('${req.session.user.id}', '${req.body.title}', '${req.body.description}', '${req.body.mask}', '${req.body.maskIdx}', '${req.body.area}', ${req.body.people}, '${req.body.link}')`;
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.redirect('/purchase')
    })
})


//공구 입력 시 마스크 검색 페이지
router.get('/purchase_search', (req, res) => {
    let sql = `select * from MASK`
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.render('purchase_search.ejs', {
            method: 'all',
            dataArr: result,
            login: req.session.user
        })
    })
})

//공구 입력 시 마스크 검색 페이지 (post)
router.post('/purchase_search', (req, res) => {
    const data = req.body
    let sql = `select * from PURCHASE WHERE 1= 1 AND title LIKE '%${data.search}%'`
    if (data.area)
        sql += `AND location = '${data.area}'`
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.send(result);
    })
})


//진행중인 공구만 보기 클릭 시
router.post('/purchase_search_active', (req, res) => {
    const data = req.body
    let sql = `select * from PURCHASE WHERE 1= 1 AND title LIKE '%${data.search}%' AND status = 1 `
    if (data.area)
        sql += `AND location = '${data.area}'`
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.send(result);
    })
})

module.exports = router;