var express = require('express');
var router = express.Router();
var predavac=require('../api/predavac');
var admin=require('../api/admin');
var publika=require('../api/publika');
const Console = require("console");
const {options} = require("pg/lib/defaults");
var url=require("url");


router.get('/pridruzi', function(req, res, next) {
    res.render('kod', { title: 'SLIDO' });
});
router.post('/pridruzi',publika.provjeriKod,function (req, res, next){
    if(req.body.kod){
       res.redirect(`/publika/${req.body.kod}`);
   }
});
router.get('/:kod',publika.dajSliku,publika.dajPitanja,function (req, res, next){
    res.render('publika/pocetna',{slike:req.slike,kod:req.params.kod,pitanje:req.pitanje});
});

router.post('/:kod/postaviPitanje',publika.postaviPitanje,function (req, res, next){
});
router.get('/:kod/postaviPitanje',publika.dajSliku,publika.dajPitanja,publika.postaviPitanje,function (req, res, next) {
   res.render('publika/pocetna',{slike:req.slike,kod:req.params.kod,pitanje:req.pitanje});
});
router.post('/:kod/lajkaj/:id',publika.dajLajk,function (req, res, next){

});
router.get('/:kod/lajkaj/:id',publika.dajSliku,publika.dajPitanja,publika.dajLajk,function (req, res, next){
   res.render('publika/pocetna',{slike:req.slike,kod:req.params.kod,pitanje:req.pitanje});
});
router.post('/:kod/ocjena',publika.ocijeniPredavanje,function (req, res, next){
});
router.get('/:kod/ocjena',publika.dajSliku,publika.dajPitanja,function (req, res, next){
    res.render('publika/ocjena',{slike:req.slike,kod:req.params.kod,pitanje:req.pitanje});
});

module.exports = router;