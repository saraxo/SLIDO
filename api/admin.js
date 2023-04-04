var pool=require('../database/database');
var express = require('express');
var bcrypt=require('bcrypt');
const upload = require("../util/cloudinary");
const util = require('../util/util_functions');
const saltRounds=15;

let pomocna={
    kriptujSifru:function (sifra) {
        return bcrypt.hashSync(sifra, saltRounds);
    },
    provjeriSifru:function (sifra){
        return bcrypt.compareSync(sifra,saltRounds);
    }
}
admin={
    dajKorisnike:function (req,res,next){
        pool.connect(function (err,client,done){
            if(err){
                return res.send(err);
            }
            client.query('SELECT * FROM korisnik WHERE tip_korisnika=$1',['predavac'],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }
                else{
                    req.korisnik=result.rows;
                    next();
                }
            });
        });
    },
    dajPredavanja:function (req,res,next){
        pool.connect(function (err,client,done){
            if(err){
                return res.send(err);
            }
            client.query('SELECT * FROM predavanja WHERE aktivno=$1',['da'],function (err,result){
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
    dajZabranjeneRijeci:function (req,res,next){
        pool.connect(function (err,client,done){
            if(err){
                return res.send(err);
            }
            client.query('SELECT * FROM zabranjene_rijeci',[],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }
                else{
                    req.zabranjene_rijeci=result.rows;
                    next();
                }
            });
        });
    },
    obrisiRijec: function (req,res) {
        pool.query('DELETE FROM zabranjene_rijeci WHERE id_rijeci = $1', [req.params.id], (error, results) => {
            if (error){
                throw error;
            }
            else{
                res.redirect('back');
            }

        });
    },
    dodajNovuRijec:function (req,res,next){
        pool.connect(function (err, client, done) {
            if (err)
                return res.send(err);
            client.query(`INSERT INTO zabranjene_rijeci(rijec) VALUES ($1)`,[req.body.rijec],function (err, result){
                done();
                if (err){
                    return res.send(err);
                }

                else{
                    req.rijeci=result.rows;
                    res.redirect('back');
                }
            });
        });
    },
    dajKorisnikaID:function (req,res,next){
        pool.connect(function (err,client,done){
            if(err){
                return res.send(err);
            }

            client.query('SELECT * FROM korisnik where id_korisnika=$1',[req.params.id],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }
                else{
                    req.korisnik=result.rows;
                    next();
                }
            });
        });
    },
    jelBlokiran:function (req,res,next){
        pool.connect(function (err,client,done){
           if(err){
               return res.send(err);
           }
           client.query('SELECT korisnik.id_korisnika,korisnik.ime,korisnik.prezime,korisnik.email,korisnik.tip_korisnika,blok.status FROM korisnik LEFT JOIN blok ON korisnik.id_korisnika=blok.id_korisnika + WHERE korisnik.email=$1 AND (blok.status=$2 OR blok.status IS NULL OR (blok.dan_blokiranja+blok.brojDana)>NOW())',[req.body.email,'da'],function(err,result){
               done();
               if(err){
                   return res.send(err);
               }
               else{
                   req.korisnik=result.rows;
                   next();
               }
           });
        });
    },
    kreirajNovogKorisnika:function (req,res,next){
        var newKorisnik={
            ime:req.body.ime,
            prezime:req.body.prezime,
            email:req.body.email,
            sifra:pomocna.kriptujSifru(req.body.sifra),
            tip_korisnika:req.body.tip_korisnika
        }
        pool.connect(function (err,client,done){
            if(err){
                return res.send(err);
            }
            client.query('INSERT INTO korisnik(ime,prezime,email,sifra,tip_korisnika) VALUES ($1,$2,$3,$4,$5)',
                [newKorisnik.ime,newKorisnik.prezime,newKorisnik.email,newKorisnik.sifra,newKorisnik.tip_korisnika],function (err,result){
                done();
                if(err){
                    return res.send(err);
                }
                else{
                    res.redirect('back');
                    req.korisnik=result.rows;

                    next();
                }
            });
        });
    },
    obrisiKorisnika: function (req,res) {
        pool.query('DELETE FROM korisnik WHERE id_korisnika = $1', [req.params.id], (error, results) => {
            if (error){
                throw error;
            }
            else{
                res.redirect('back');
            }

        });
    },
    updateKorisnika: function (req,res,next) {
        pool.connect(function (err, client, done) {
            if (err)
                return res.send(err);
            client.query(`UPDATE korisnik SET ime  = $1, prezime = $2, email= $3 WHERE id_korisnika = $4`, [req.body.ime,req.body.prezime,req.body.email,req.params.id],function (err, result){
                        done();
                        if (err){
                            return res.send(err);
                        }

                        else{
                            req.korisnik=result.rows;
                            res.redirect('back');
                        }
                });
        });
    },
    dodajSliku: async (req, res, next) => {
        let result = await upload(util.dataUri(req.files.image.name, req.files.image.data))
        let query = `INSERT INTO slike (id_predavanja, ime_slike, url_slike, broj_slike) VALUES ($1, $2, $3, 1)`
        const params = [req.body.name, req.files.image.name, result.secure_url]

        pool.query(query, params, (err, result) => {
            if (err) console.log(err)
            else
                next()
        })
    },
    obrisiPredavanje: function (req,res) {
        console.log(req.params.id)
        pool.query('UPDATE predavanja set aktivno=$1 where id_predavanja=$2', ['ne',req.params.id], (error, results) => {
            if (error){
                throw error;
            }
            else{
                res.redirect('back');
            }

        });
    },
    updatePredavanje: function (req,res,next) {
        pool.connect(function (err, client, done) {
            if (err)
                return res.send(err);
            client.query(`UPDATE predavanja SET kod  = $1, naziv = $2, dan_predavanja= $3, vrijeme_predavanja=$4, ponavljanje=$5 WHERE id_predavanja = $6`,
                [req.body.kod,req.body.naziv,req.body.dan,req.body.vrijeme,req.body.ponavljanje,req.params.id],function (err, result){
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
    blokirajKorisnika: function (req,res,next) {
        pool.connect(function (err, client, done) {
            if (err)
                return res.send(err);
            client.query(`INSERT INTO blok(id_korisnika,brojdana,dan_blokiranja,status) VALUES ($1,$2,$3,$4)`, [req.params.id,req.body.broj,req.body.datum,'da'],function (err, result){
                done();
                if (err){
                    return res.send(err);
                }

                else{
                    req.blok=result.rows;
                    res.redirect('back');
                }
            });
        });
    },
    dajPitanjaAdmin:function (req,res,next){
        pool.connect(function (err,client,done){
            if(err){
                return res.send(err);
            }
            client.query('SELECT * FROM pitanje WHERE aktivno =$1',['da'],function (err,result){
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
    obrisiPitanjeAdmin: function (req,res) {
        pool.query('UPDATE pitanje SET aktivno=$1 WHERE id_pitanja =$2',['ne',req.params.id], (error, results) => {
            if (error){
                throw error;
            }
            else{
                res.redirect('back');
            }
        });
    }

}
module.exports=admin;
