var express = require('express');
var router = express.Router();
var predavac=require('../api/predavac');

router.get('/novi-korisnik', function(req, res, next) {
    res.render('register', { title: 'REGISTRACIJA' });
});

router.post('/novi-korisnik',predavac.registrujKorisnika,function (req, res, next){
    res.redirect('/login');
});

module.exports=router;