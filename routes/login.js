var express = require('express');
var router = express.Router();
var jwt=require('jsonwebtoken');
var predavac=require('../api/predavac');

router.get('/',function (req,res,next){
    res.render('prijava',{title:'PRIJAVA'});
});

router.post('/',predavac.provjeriKorisnika,function (req, res, next){
    if(req.korisnik){
        const token=jwt.sign(req.korisnik,'balaton',{expiresIn: 60*60*24});
        res.cookie('korisnik_token',token);
        res.cookie('korisnik',req.korisnik);
        console.log(req.korisnik)

        console.log(req.cookies.korisnik_token)
        let tipKorisnika=req.korisnik.tip_korisnika;
        if (tipKorisnika==='predavac'){
            res.redirect(`/predavac/${req.korisnik.id_korisnika}`);
        }
        else{
            res.redirect('/admin/pocetna');
        }
    }
});
module.exports=router;