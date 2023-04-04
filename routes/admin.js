var express = require('express');
var router = express.Router();
const admin=require('../api/admin');
const Console = require("console");
const {options} = require("pg/lib/defaults");


router.post('/urediKorisnike/:id/uredi',admin.updateKorisnika,function (req, res, next){
});
router.post('/urediKorisnike/:id/blok',admin.blokirajKorisnika,function (req, res, next){
});
router.post('/urediRijeci/:id',admin.obrisiRijec,function (req, res, next){
});
router.post('/urediPredavanja/:id',admin.updatePredavanje,function (req, res, next){
});
router.post('/urediPredavanja/obrisi/:id',admin.obrisiPredavanje,function (req, res, next){
});
router.get('/urediKorisnike', admin.dajKorisnike, function(req, res, next) {
    res.render('admin/upravljajKorisnicima', { title: 'Korisnici', korisnik: req.korisnik,id:req.cookies.korisnik.id_korisnika});
});
router.get('/urediKorisnike/:id/uredi',admin.dajKorisnike,admin.updateKorisnika,function (req, res, next){
    res.render('admin/upravljajKorisnicima',{title:"Korisnici",korisnik:req.korisnik,id:req.cookies.korisnik.id_korisnika});
});
router.post('/urediKorisnike',admin.kreirajNovogKorisnika,function (req, res, next){
});
router.get('/pocetna',function (req,res,next){
   res.render('admin/pocetna',{title:'Pocetna stranica'})
});
router.get('/urediPredavanja',admin.dajPredavanja,function (req, res, next){
   res.render('admin/upravljajPredavanjima',{title:"Predavanja",predavanja:req.predavanja,id:req.predavanja.id_predavanja,korisnik:req.korisnik});
});
router.get('/urediPredavanja/obrisi/:id',admin.obrisiPredavanje,function (req, res, next){
   res.render('admin/upravljajPredavanjima',{title:"Predavanja",id:req.predavanja.id_predavanja,predavanja:req.predavanja})
});
router.get('/urediRijeci',admin.dajZabranjeneRijeci,function (req, res, next){
    res.render('admin/listaRijeci',{title:'Zabranjene rijeci',rijeci:req.zabranjene_rijeci});
});
router.post('/urediRijeci',admin.dodajNovuRijec,function (req, res, next){
});
router.get('/urediRijeci/:id',admin.obrisiRijec,function (req, res, next){
   res.render('admin/listaRijeci');
});
router.post('/Pitanja/:id',admin.obrisiPitanjeAdmin,function (req, res, next){
});
router.get('/Pitanja/:id',admin.obrisiPitanjeAdmin,function (req, res, next){
   res.render('admin/pitanja',{title:"LISTA PITANJA",pitanje:req.pitanje})
});
router.get('/Pitanja',admin.dajPitanjaAdmin,function (req, res, next){
   res.render('admin/pitanja',{title:"LISTA PITANJA",pitanje:req.pitanje}) ;
});
router.get('/obrisi/:id',admin.obrisiKorisnika,function (req,res,next){
    res.render('admin/upravljajKorisnicima');
});
router.get('/odjava',function (req,res,next){
    res.redirect('/');
});
module.exports=router;