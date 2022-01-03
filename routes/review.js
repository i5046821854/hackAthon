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

//후기 페이지 (get)
router.get('/review', (req, res) => {
    var sql = '';
    if (!!(req.query.prodIdx)) {
        sql = `select a.*, b.image from REVIEW a inner join MASK b on a.prodIdx = b.idx WHERE a.prodIdx = ${req.query.prodIdx}`
    } else {
        sql = `select a.*, b.image from REVIEW a inner join MASK b on a.prodIdx = b.idx`
    }
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.render('review.ejs', {
            method: 'all',
            dataArr: result,
            login: (req.session.user ? true : false)
        })
    })
})

//후기 제출시 
router.post('/review', (req, res) => {
    const data = req.body
    let sql = `select a.*, b.image from REVIEW a inner join MASK b on a.prodidx = b.idx`
    if (Object.keys(data).length != 0) {
        sql = sql + ' WHERE 1=1 '
        if (data.strap)
            sql = sql + `AND a.strap = '${data.strap}' `;
        if (data.kf)
            sql = sql + `AND a.kf = '${data.kf}'`;
        if (data.size)
            sql = sql + `AND a.size = '${data.size}'`;
        if (data.shape)
            sql = sql + `AND a.shape = '${data.shape}'`;
    }
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.send(result);
    })
})

//후기 작성 페이지(get)
router.get('/review_writing', auth, (req, res) => {
    res.render('review_writing.ejs', {
        login: (req.session.user ? true : false)
    })
})
router.post('/review_writing', async(req, res) => {
    const data = req.body
    var sql = `INSERT INTO REVIEW(nickname, title, maskname, contents, strap, kf, size, shape, prodIdx) values ('${req.session.user.nickname}', '${data.title}', '${data.name}', '${data.content}', '${data.strap}', '${data.kf}', '${data.size}', '${data.shape}', ${data.hidden})`

    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.send(`<script>window.location.href='/review'<\script>`);
    })

})

//후기 수정 페이지(get)
router.get('/review_reform', (req, res) => {
    let sql = `select * from MASK where idx = ${req.query.Idx}`;
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.render('review_reform.ejs', {
            prodName: result[0].prodName,
            idx: req.query.Idx,
            login: (req.session.user ? true : false)
        })
    })
})

//후기 수정 페이지(post)
router.post('/review_reform', auth, (req, res) => {
    let sql = `update REVIEW set title = '${req.body.title}', maskname = '${req.body.maskname}',contents = '${req.body.contents}', strap = '${req.body.strap}', kf = '${req.body.kf}', size = '${req.body.size}', shape = '${req.body.shape}' WHERE Idx = ${req.body.prodIdx}`;
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.redirect('/review');
    })
})

//후기 삭제(get)
router.post('/review_delete', (req, res) => {
    const data = req.body;
    let sql = `DELETE from REVIEW WHERE idx = '${data.idx}' AND nickname = '${req.session.user.nickname}'`;
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.send(result);
    })
})

module.exports = router;