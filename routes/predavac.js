var express = require('express');
var router = express.Router({ mergeParams: true });

var predavac=require('../api/predavac');
var admin=require('../api/admin');
var publika=require('../api/publika');
const Console = require("console");
const {options} = require("pg/lib/defaults");
var url=require("url");
const nodemailer = require("nodemailer");



router.get('/:id',admin.dajKorisnikaID,function (req,res,next){
    res.render('predavac/pocetna',{title:'POCETNA',id:req.cookies.korisnik.id_korisnika,korisnik:req.korisnik});
});
router.post('/:id/kod',function (req, res, next){
   if(req.body.kod){
       var kodZaPoslati=req.body.kod;
       res.redirect(`/predavac/${req.cookies.korisnik.id_korisnika}`)
   }
    async function main() {
        var transporter = nodemailer.createTransport({
            secure: false,
            service:"Outlook",
            tls:{
                rejectUnauthorized: false,
            },
            auth: {
                user: 'sara54jerinic@outlook.com',
                pass: 'opera54opera54',
            },
        });

        var info = await transporter.sendMail({
            from: "sara54jerinic@outlook.com",
            to: "diane987volim@gmail.com",
            subject: "Kod za pristupanje",
            text: "Dobro došli, Vaš kod za pristup predavanju je "+kodZaPoslati,
            html: "Dobro došli, Vaš kod za pristup predavanju je " + kodZaPoslati
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    main().catch(console.error);
});
router.get('/:id/kod',function (req, res, next){
    res.render('predavac/kod',{title:'KOD',id:req.cookies.korisnik.id_korisnika,korisnik:req.korisnik});
});

router.post('/:id/mail',admin.dajKorisnikaID,publika.dajSliku,publika.dajPitanja,function (req, res, next){
    if(req.body.listaAdresa && req.body.kod) {
        var adrese = req.body.listaAdresa.split(',');
        var kodZaPoslati = req.body.kod;
        res.redirect('back');
    }
    async function main() {
        var transporter = nodemailer.createTransport({
            secure: false,
            service:"Outlook",
            tls:{
                rejectUnauthorized: false,
            },
            auth: {
                user: 'sara54jerinic@outlook.com',
                pass: 'opera54opera54',
            },
        });

        var info = await transporter.sendMail({
            from: "sara54jerinic@outlook.com",
            to: adrese,
            subject: "Link za pristupanje",
            text: "Dobro došli, Vaš link za pristup predavanju je " +"<br> Link za predavanje: http://localhost:3000/publika/"+kodZaPoslati,
            html: "Dobro došli, Vaš link za pristup predavanju je " + "<br>Link za predavanje: <a href='http://localhost:3000/publika/" + kodZaPoslati + "'>http://localhost:3000/publika/" + kodZaPoslati + "</a>"
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    main().catch(console.error);
});
router.get('/:id/mail',admin.dajKorisnikaID,function (req, res, next){
    res.render('predavac/mail',{title:"MAIL",id:req.cookies.korisnik.id_korisnika,korisnik:req.korisnik});
});

router.get('/:id/predavanja',admin.dajKorisnikaID,predavac.dajSvaPredavanja,predavac.brojPostavljenih,function (req, res, next){
    res.render('predavac/predavanja',{title:"PREDAVANJA",id:req.cookies.korisnik.id_korisnika,korisnik:req.korisnik,
                                                    predavanja:req.predavanja,pitanje:req.pitanje});
});
router.post('/:id/predavanja/uredi',predavac.urediPredavanje,function (req, res, next){

});
router.get('/:id/predavanja/uredi',admin.dajKorisnikaID,predavac.dajPredavanje,predavac.brojPostavljenih,predavac.urediPredavanje,function (req, res, next){
   res.render('predavac/predavanja',{title:"PREDAVANJA",id:req.cookies.korisnik.id_korisnika,korisnik:req.korisnik,
   predavanja:req.predavanja,pitanje:req.pitanje});
});
router.post('/:id/predavanja/obrisi/:id2',predavac.obrisiPredavanje,function (req, res, next){
});
router.get('/:id/predavanja/obrisi/:id2',admin.dajKorisnikaID,predavac.dajPredavanje,predavac.brojPostavljenih,predavac.obrisiPredavanje,function (req, res, next){
   res.render('predavac/predavanja',{title:"PREDAVANJA",id:req.cookies.korisnik.id_korisnika,id2:req.predavanja.id_predavanja,korisnik:req.korisnik,
   predavanja:req.predavanja,pitanje:req.pitanje});
});
router.get('/:id/nadolazeca',admin.dajKorisnikaID,predavac.brojPostavljenih,predavac.dajSvaPredavanja,predavac.sortNovi,function (req,res,next){
    res.render('predavac/predavanja', {title:"PREDAVANJA",id:req.cookies.korisnik.id_korisnika,korisnik:req.korisnik,
        predavanja:req.predavanja,broj_pitanja:req.predavanja.broj_pitanja, broj_odgovorenih:req.predavanja.broj_odgovorenih,pitanje:req.pitanje});
});
router.get('/:id/prosla',admin.dajKorisnikaID,predavac.brojPostavljenih,predavac.dajSvaPredavanja,predavac.sortStari,function (req,res,next){
    res.render('predavac/predavanja', {title:"PREDAVANJA",id:req.cookies.korisnik.id_korisnika,korisnik:req.korisnik,
        predavanja:req.predavanja,broj_pitanja:req.predavanja.broj_pitanja, broj_odgovorenih:req.predavanja.broj_odgovorenih,pitanje:req.pitanje});
});
router.get('/:id/lajkovi',admin.dajKorisnikaID,predavac.brojPostavljenih,predavac.dajSvaPredavanja,predavac.sortLajkovi,function (req, res, next){
   res.render('predavac/predavanja',{title:"PREDAVANJA",id:req.cookies.korisnik.id_korisnika,korisnik:req.korisnik,
   predavanja:req.predavanja,broj_pitanja:req.predavanja.broj_pitanja,broj_odgovorenih:req.predavanja.broj_odgovorenih,pitanje:req.pitanje});
});
router.get('/:id/predavanja/:id2',predavac.dajPredavanje,admin.dajKorisnikaID,predavac.listaPitanja,function (req, res, next){
    let filtriranaPitanja = req.pitanje.filter( pitanje => pitanje.aktivno === 'da');
    res.render('predavac/predavanje',{title:"PREDAVANJE",predavanja:req.predavanja,id:req.cookies.korisnik.id_korisnika,korisnik:req.korisnik,
        id2:req.predavanja.id_predavanja,pitanje:req.pitanje,filtriranaPitanja,url:url});
});
/*router.get('/:id/predavanja/:id2/sakrivena',predavac.dajPredavanje,admin.dajKorisnikaID,function (req, res, next){
    res.render('predavac/sakrivena',{title:"SAKRIVENA PITANJA",predavanja:req.predavanja,id:req.cookies.id_korisnika,korisnik:req.korisnik,id2:req.predavanja.id_predavanja,
    pitanje:req.pitanje,url:url});
});*/
/*router.post('/:id/predavanja/:id2/sakrivena/:id3',predavac.odgovoriNaSkrivenoPitanje,function (req, res, next){
});
router.get('/:id/predavanja/:id2/sakrivena/:id3',predavac.odgovoriNaSkrivenoPitanje,function (req, res, next){
   res.render('predavac/predavanje',{title:"PREDAVANJE"});
});*/
router.post('/:id/predavanja/:id2/obrisi/:id3',predavac.obrisiPitanje,function (req, res, next){
});
router.get('/:id/predavanja/:id2/obrisi/:id3',predavac.obrisiPitanje,function (req, res, next){
    res.render('predavac/predavanje');
});
router.post('/:id/predavanja/:id2/odg/:id3',predavac.odgovoriNaPitanje,function (req, res, next){
});
router.get('/:id/predavanja/:id2/odg/:id3',predavac.odgovoriNaPitanje,function (req, res, next){
    res.render('predavac/predavanje');
});

router.post('/:id/predavanja',predavac.kreirajPredavanje,predavac.dodajSliku,function (req, res, next){
});

router.get('/:id/odjavi',function (req, res, next){
    res.clearCookie('korisnik');
    res.redirect('/');
});

module.exports=router;