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

//탐색 조회 페이지
router.get('/search', (req, res) => {
    let sql = `select * from MASK`
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.render('search.ejs', {
            method: 'all',
            dataArr: result,
            login: req.session.user
        })
    })
})


//탐색 시 검색 (post)
router.post('/search', (req, res) => {
    const data = req.body
    let sql = `select * from MASK`
    if (Object.keys(data).length != 0) {
        sql = sql + ' WHERE 1=1 '
        if (data.strap)
            sql = sql + ` AND strap = '${data.strap}' `;
        if (data.design)
            sql = sql + ` AND design = '${data.design}'`;
        if (data.filter)
            sql = sql + ` AND kf = '${data.filter}' `;
        if (data.size)
            sql = sql + ` AND size = '${data.size}'`;
        sql = sql + `AND replace(prodName, '-', '') LIKE '%${data.name}%'`
    }
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        if (result.length == 0 && islogin) {
            sql = `select ((select if(a.strap = '${data.strap}',b.strapnum,0)) + (select if(a.design = '${data.design}',b.shapenum,0)) + (select if(a.kf = '${data.filter}',b.kfnum,0)) + (select if(a.size = '${data.size}',b.sizenum,0))) as close, a.* from MASK as a, USER as b WHERE (a.strap = '${data.strap}' OR a.design = '${data.design}' OR a.kf = '${data.filter}' OR a.size = '${data.size}') AND b.id = '${req.session.user.id}' ORDER BY close DESC;`
            db.query(sql, async(err, result) => {
                if (err)
                    console.log(err);
                result.unshift("실패")
                res.send(result);
            })
        } else if (result.length == 0 && !islogin) {
            sql = `select ((select if(a.strap = '${data.strap}',1,0)) + (select if(a.design = '${data.design}',1,0)) + (select if(a.kf = '${data.filter}',1,0)) + (select if(a.size = '${data.size}',1,0))) as close, a.* from MASK as a WHERE a.strap = '${data.strap}' OR a.design = '${data.design}' OR a.kf = '${data.filter}' OR a.size = '${data.size}'  ORDER BY close DESC;`
            db.query(sql, async(err, result) => {
                if (err)
                    console.log(err);
                result.unshift("실패")
                res.send(result);
            })
        } else {
            result.unshift("성공")
            res.send(result);
        }
    })
})


//상세정보 페이지 (get)
router.get('/detail', (req, res) => {
    let sql = `select * from MASK WHERE idx = ${req.query.prod};`
    if (islogin) {
        var sql2 = `select COUNT(*) from CART WHERE prodIdx = ${req.query.prod} AND id = '${req.session.user.id}'`
        var checked = true;
        db.query(sql + sql2, async(err, result) => {
            if (err) {
                console.log(err);
            }
            if (result[1][0]['COUNT(*)'] == 0)
                checked = false;
            res.render('detail.ejs', {
                data: result[0][0],
                check: checked,
                login: islogin
            })
        })
    } else {
        db.query(sql, async(err, result) => {
            if (err)
                console.log(err);
            res.render('detail.ejs', {
                data: result[0],
                check: false,
                login: islogin
            })
        })
    }
})


//탐색 - 추천 페이지
router.get('/search/recommend', auth, (req, res) => {
    let sql1 = `select * from MASK;`
    let sql2 = `select ((select if(a.strap = b.strap,b.strapnum,0)) + (select if(a.design = b.shape,b.shapenum,0)) + (select if(a.kf = b.kf,b.kfnum,0)) + (select if(a.size = b.size,b.sizenum,0))) as close, a.* from MASK as a, USER as b WHERE (a.strap = b.strap OR a.design = b.shape OR a.kf = b.kf OR a.size = b.size) AND b.id = '${req.session.user.id}' ORDER BY close DESC limit 15;`
    db.query(sql1 + sql2, async(err, result) => {
        if (err)
            console.log(err);
        res.render('search.ejs', {
            method: 'recommend',
            dataArr: result[0],
            recommendData: result[1],
            login: req.session.user
        })
    })
})


//찜하기 클릭 시
router.post('/check', (req, res) => {
    const idx = Number(req.body.idx)
    if (req.body.checked == '1')
        var sql = `insert into CART (id,prodIdx) values ('${req.session.user.id}', ${req.body.idx})`
    else
        sql = `delete from CART where id = '${req.session.user.id}' AND prodIdx =  ${req.body.idx}`
    db.query(sql, async(err, result) => {
        if (err)
            console.log(err);
        res.send(result)
    })
});

module.exports = router;