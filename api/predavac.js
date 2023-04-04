var pool=require('../database/database');
var express = require('express');
var router = express.Router();
var bcrypt=require('bcrypt');
const upload = require("../util/cloudinary");
const util = require("../util/util_functions");
const moment = require('moment');
const saltRounds=15;

let pomocna={
    kriptujSifru:function (sifra) {
        return bcrypt.hashSync(sifra, saltRounds);
    },
    provjeriSifru:function (sifra){
        return bcrypt.compareSync(sifra,saltRounds);
    }
}
predavac={
    registrujKorisnika:function (req,res,next){
        var noviKorisnik={
            ime:req.body.ime,
            prezime:req.body.prezime,
            email:req.body.email,
            sifra:pomocna.kriptujSifru(req.body.sifra),
        };

        pool.connect(function (err,client,done){
            if(err){
                res.end('{"error" : "Error","status": 500}');
            }
            client.query('INSERT INTO korisnik(ime,prezime,email,sifra,tip_korisnika) VALUES ($1,$2,$3,$4,$5)',
                [noviKorisnik.ime,noviKorisnik.prezime,noviKorisnik.email,noviKorisnik.sifra,'predavac'],function (err,result){
                    done();
                    if (err){
                        res.sendStatus(500);
                    }
                    else{
                        req.korisnik=result.rows;
                        next();
                    }
                });
            });
        },
    provjeriKorisnika:function (req,res,next){
        var Korisnik={
            email:req.body.email,
            sifra:req.body.sifra
        };
        pool.connect(function (err,client,done){
            if(err){
                res.end('{"error" : "Error","status": 500}');
            }
            client.query('SELECT * from korisnik WHERE email=$1',[Korisnik.email],function (err,result){
                    done();
                    if (err){
                        res.sendStatus(500);
                    }
                    else{
                        if(result.rows.length===0){
                            return res.sendStatus(404);
                        }
                        else{
                            let kriptovanaSifra=result.rows[0].sifra;
                            if(bcrypt.compareSync(Korisnik.sifra,kriptovanaSifra)){
                                req.korisnik={
                                    id_korisnika:result.rows[0].id_korisnika,
                                    ime:result.rows[0].ime,
                                    prezime:result.rows[0].prezime,
                                    email:result.rows[0].email,
                                    tip_korisnika:result.rows[0].tip_korisnika
                                };
                            }
                            else{
                                return res.sendStatus(401);

                            }
                        }

                        next();
                    }
                });
        });

    },
    kreirajPredavanje: function (req,res,next){
        pool.connect((err, client, done) => {
            let promises = [];
            let dan= moment(req.body.dan);
            let ponavljanje = moment(req.body.ponavljanje);
            let kodNovi=req.body.kod;
            let brojac=0;
            while (dan.isSameOrBefore(ponavljanje)) {
                const query = {
                    name: 'insert-lecture',
                    text: 'INSERT INTO predavanja(kod,naziv,id_korisnika,dan_predavanja,vrijeme_predavanja,ponavljanje) VALUES($1,$2,$3,$4,$5,$6)',
                    values: [req.body.kod,req.body.naziv,req.body.id,req.body.dan,req.body.vrijeme,req.body.ponavljanje],
                }
                promises.push(new Promise((resolve, reject) => {
                    query.values[3] = dan.format('YYYY-MM-DD');
                    if(brojac===0){
                        query.values[0]=kodNovi;
                    }
                    else{
                        query.values[0]=kodNovi+brojac.toString();
                    }
                    client.query(query, (err, result) => {
                        if (err) reject(err);
                        else {
                            resolve();
                        }
                    });
                    dan.add(7, 'days');
                    brojac++;
                    kodNovi=req.body.kod;
                }));
            }
            Promise.all(promises)
                .then(() => {
                    done();
                    res.redirect('back');
                    next();
                })
                .catch((err) => {
                    return res.send(err);
                });
        });
    },
    dodajSliku: async (req, res, next) => {
        let result = await upload(util.dataUri(req.files.image.name, req.files.image.data))
        let query = `INSERT INTO slike (kod, ime_slike, url_slike, broj_slike) VALUES ($1, $2, $3, 1)`
        const params = [req.body.kod, req.files.image.name, result.secure_url]

        pool.query(query, params, (err, result) => {
            if (err) console.log(err)
            else
                next()
        });
    },
    dajSvaPredavanja:function (req,res,next){
        pool.connect(function (err,client,done){
            if(err){
                return res.send(err);
            }
            client.query('SELECT * FROM predavanja WHERE id_korisnika=$1',[req.params.id],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }
                else{
                    req.predavanja=result.rows;
                    next();
                }
            });
        });
    },
    brojPostavljenih:function (req,res,next){
        pool.connect(function (err,client,done){
            if(err){
                return res.send(err);
            }
            console.log(req.params.id)
            client.query('SELECT predavanja.id_predavanja,predavanja.kod,predavanja.naziv,predavanja.dan_predavanja,predavanja.vrijeme_predavanja,count(pitanje.id_pitanja) AS broj_pitanja,SUM(CASE WHEN pitanje.odgovoreno=$1 AND pitanje.aktivno=$2 THEN 1 ELSE 0 END) AS broj_odgovorenih FROM predavanja LEFT JOIN pitanje ON predavanja.id_predavanja=pitanje.id_predavanja WHERE predavanja.id_korisnika=$3 AND (pitanje.aktivno=$4 OR pitanje.aktivno IS NULL) AND predavanja.aktivno=$5 GROUP BY predavanja.id_predavanja,predavanja.kod,predavanja.naziv,predavanja.dan_predavanja,predavanja.vrijeme_predavanja',
                ['da','da',req.params.id,'da','da'],function (err,result){
                    done();
                    if(err){
                        return res.send(err);
                    }
                    else{
                        req.predavanja=result.rows;
                        //console.log(req.predavanja);
                        next();
                    }
                });
        });
    },
    sortNovi: function (req,res,next) {
        pool.connect(function (err, client, done) {
            if (err)
                return res.send(err);

            client.query('SELECT predavanja.id_predavanja,predavanja.kod,predavanja.naziv,predavanja.dan_predavanja,predavanja.vrijeme_predavanja,count(pitanje.id_pitanja) AS broj_pitanja,SUM(CASE WHEN pitanje.odgovoreno=$1 AND pitanje.aktivno=$2 THEN 1 ELSE 0 END) AS broj_odgovorenih FROM predavanja LEFT JOIN pitanje ON predavanja.id_predavanja=pitanje.id_predavanja WHERE predavanja.id_korisnika=$3 AND predavanja.dan_predavanja>NOW() AND (pitanje.aktivno=$4 OR pitanje.aktivno IS NULL) AND predavanja.aktivno=$5 GROUP BY predavanja.id_predavanja,predavanja.kod,predavanja.naziv,predavanja.dan_predavanja,predavanja.vrijeme_predavanja',
                ['da','da',req.params.id,'da','da'],function (err, result) {
                done();

                if (err){
                    return res.send(err);
                }

                else {
                    req.predavanja= result.rows;
                    next();
                }
            })
        })
    },
    sortStari: function (req,res,next) {
        pool.connect(function (err, client, done) {
            if (err)
                return res.send(err);

            client.query('SELECT predavanja.id_predavanja,predavanja.kod,predavanja.naziv,predavanja.dan_predavanja,predavanja.vrijeme_predavanja,count(pitanje.id_pitanja) AS broj_pitanja,SUM(CASE WHEN pitanje.odgovoreno=$1 AND pitanje.aktivno=$2 THEN 1 ELSE 0 END) AS broj_odgovorenih FROM predavanja LEFT JOIN pitanje ON predavanja.id_predavanja=pitanje.id_predavanja WHERE predavanja.id_korisnika=$3 AND predavanja.dan_predavanja<NOW() AND (pitanje.aktivno=$4 OR pitanje.aktivno IS NULL) AND predavanja.aktivno=$5 GROUP BY predavanja.id_predavanja,predavanja.kod,predavanja.naziv,predavanja.dan_predavanja,predavanja.vrijeme_predavanja',
                ['da','da',req.params.id,'da','da'],function (err, result) {
                done();

                if (err)
                    return res.send(err);
                else {
                    req.predavanja= result.rows;
                    next();
                }
            })
        })
    },
    sortLajkovi: function (req,res,next) {
        pool.connect(function (err, client, done) {
            if (err)
                return res.send(err);

            client.query('SELECT predavanja.id_predavanja,predavanja.kod,predavanja.naziv,predavanja.dan_predavanja,predavanja.vrijeme_predavanja,count(pitanje.id_pitanja) AS broj_pitanja,SUM(CASE WHEN pitanje.odgovoreno=$1 AND pitanje.aktivno=$2 THEN 1 ELSE 0 END) AS broj_odgovorenih,SUM(pitanje.lajk) AS suma_lajkova FROM predavanja LEFT JOIN pitanje ON predavanja.id_predavanja=pitanje.id_predavanja WHERE predavanja.id_korisnika=$3 AND (pitanje.aktivno=$4 OR pitanje.aktivno IS NULL) AND predavanja.aktivno=$5 GROUP BY predavanja.id_predavanja,predavanja.kod,predavanja.naziv,predavanja.dan_predavanja,predavanja.vrijeme_predavanja ORDER BY suma_lajkova',
                ['da','da',req.params.id,'da','da'],function (err, result) {
                    done();

                    if (err)
                        return res.send(err);
                    else {
                        req.predavanja= result.rows;
                        next();
                    }
                })
        })
    },
    dajPredavanje:function (req,res,next){
        pool.connect(function (err,client,done){
            if(err){
                return res.send(err);
            }
            client.query('SELECT * FROM predavanja WHERE id_predavanja=$1',[req.params.id2],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }
                else{
                    req.predavanja=result.rows;
                    next();
                }
            });
        });
    },
    listaPitanja:function (req,res,next){
        pool.connect(function (err,client,done){
            if(err){
                return res.send(err);
            }
            client.query('SELECT * FROM pitanje WHERE id_predavanja=$1 AND skriveno=$2',[req.params.id2,'ne'],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }
                else{
                    req.pitanje=result.rows;
                    next();
                }
            });
        });
    },
    obrisiPitanje: function (req,res) {
        pool.query('UPDATE pitanje SET aktivno=$1 WHERE id_pitanja =$2',['ne',req.params.id3], (error, results) => {
            if (error){
                throw error;
            }
            else{
                res.redirect('back');
            }
        });
    },
    odgovoriNaPitanje: function (req,res) {
        pool.query('UPDATE pitanje SET odgovoreno=$1 WHERE id_pitanja =$2',['da',req.params.id3], (error, results) => {
            if (error){
                throw error;
            }
            else{
                res.redirect('back');
            }
        });
    },
    /*listaSakrivenih: function (req, res, next) {
        pool.connect(function (err, client, done) {
            if (err) {
                return res.send(err);
            }

            client.query('SELECT * FROM pitanje JOIN zabranjene_rijeci ON pitanje.sadrzaj_pitanja LIKE CONCAT(\'%\', zabranjene_rijeci.rijec, \'%\') WHERE pitanje.id_predavanja=$1 AND pitanje.aktivno=$2', [req.params.id2, 'da'])
                .then(results => {
                    req.pitanje = results.rows;
                    return client.query('UPDATE pitanje SET skriveno=$1 WHERE id_pitanja=$2', ['da', results.rows[0].id_pitanja])
                })
                .then(results => {
                    req.pitanje = results.rows;
                    next();
                    done();
                })
                .catch(err => {
                    console.log(err.stack)
                    done();
                });
        });
    },
    dajSkrivenaPitanja:function (req,res,next){
       pool.connect(function (err,client,done){
           if(err){
               return res.send(err);
           }
           client.query('SELECT * FROM pitanje JOIN zabranjene_rijeci ON pitanje.sadrzaj_pitanja LIKE CONCAT(\'%\', zabranjene_rijeci.rijec, \'%\') WHERE pitanje.id_predavanja=$1 AND pitanje.aktivno=$2',[req.params.id2,'da'],function (err,result){
               done();
               if(err){
                   return res.send(err);
               }
               else{
                   req.pitanje=result.rows;
                   next();
               }
           });
       });
   },

    odgovoriNaSkrivenoPitanje: function (req,res) {
        pool.query('UPDATE pitanje SET odgovoreno=$1,skriveno=$2 WHERE id_pitanja =$3',['da','ne',req.params.id3], (error, results) => {
            if (error){
                throw error;
            }
            else{
                console.log('cao cao mace')
                res.redirect('predavac/');
            }
        });
    },*/
    urediPredavanje: function (req,res,next) {
        pool.connect(function (err, client, done) {
            if (err)
                return res.send(err);
            client.query(`UPDATE predavanja SET kod  = $1, naziv = $2, dan_predavanja= $3, vrijeme_predavanja=$4, ponavljanje=$5 WHERE id_predavanja = $6`,
                [req.body.kod,req.body.naziv,req.body.dan,req.body.vrijeme,req.body.ponavljanje,req.body.id],function (err, result){
                    done();
                    if (err){
                        return res.send(err);
                    }

                    else{
                        req.predavanja=result.rows;
                        res.redirect('back');
                    }
                });
        });
    },
    obrisiPredavanje: function (req,res) {
        pool.query('UPDATE predavanja set aktivno=$1 where id_predavanja=$2', ['ne',req.params.id2], (error, results) => {
            if (error){
                throw error;
            }
            else{
                res.redirect('back');
            }

        });
    }


}
module.exports=predavac;