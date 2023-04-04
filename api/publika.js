var pool=require('../database/database');
var express = require('express');
var router = express.Router();

publika={
    provjeriKod:function (req,res,next){
        pool.connect(function (err,client,done){
            if(err){
                res.end('{"error" : "Error","status": 500}');
            }
            client.query('SELECT * from predavanja WHERE kod=$1',[req.body.kod],function (err,result){
                done();
                if (err){
                    res.sendStatus(500);
                }
                else{
                    req.predavanja=result.rows;
                    next();
                }
            });
        });
    },
    dajKod:function (req,res,next){
        pool.connect(function (err,client,done){
            if(err){
                return res.send(err);
            }
            client.query('SELECT * FROM predavanja WHERE kod =$1)',[req.params.kod],function (err,result){
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
    dajPitanja:function (req,res,next){
        pool.connect(function (err,client,done){
            if(err){
                return res.send(err);
            }
            client.query('SELECT sadrzaj_pitanja,id_pitanja,lajk FROM pitanje WHERE id_predavanja = (SELECT id_predavanja FROM predavanja WHERE kod =$1)'+
                         'AND aktivno =$2 AND skriveno =$3',[req.params.kod,'da','ne'],function (err,result){
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
    dajSliku: function (req, res, next) {
        pool.connect(function (err, client, done) {
            if (err)
                return res.send(err);

            client.query(`SELECT slike.url_slike FROM predavanja JOIN slike ON predavanja.kod LIKE slike.kod ||'%'WHERE predavanja.kod = $1 `, [req.params.kod],
                function (err, result) {
                    done();

                    if (err) {
                        return res.send(err);
                    }
                    else{
                        req.slike = result.rows[0];
                        next();
                    }

                })
        })

    },
    postaviPitanje:function (req,res,next){
        pool.connect(function (err, client, done) {
            if (err)
                return res.send(err);
            client.query(`INSERT INTO pitanje (id_predavanja, sadrzaj_pitanja,aktivno,skriveno,odgovoreno)SELECT id_predavanja, $1, $2, $3, $4 FROM predavanja WHERE kod = $5`,[req.body.sadrzaj,'da','ne','ne',req.params.kod],function (err, result){
                 done();
                if (err){
                    return res.send(err);
                }

                else{
                    req.pitanje=result.rows;
                    res.redirect('back');
                }
            });
        });
    },
    ocijeniPredavanje:function (req,res,next){
        pool.connect(function (err, client, done) {
            if (err)
                return res.send(err);
            var ocjena = req.body.inlineRadioOptions;
            client.query(`INSERT INTO ocjena(kod,ocjena) VALUES($1,$2)`,[req.params.kod,ocjena],function (err, result){
                done();
                if (err){
                    return res.send(err);
                }

                else{
                    req.ocjena=result.rows;
                    res.redirect(`/publika/${req.params.kod}`);
                }
            });
        });
    },
    dajLajk:function (req,res,next){
        pool.connect(function (err, client, done) {
            if (err)
                return res.send(err);

            client.query(`UPDATE pitanje SET lajk=lajk+1 WHERE id_pitanja=$1`,[req.params.id],function (err, result){
                done();
                if (err){
                    return res.send(err);
                }

                else{
                    res.redirect('back');
                }
            });
        });
    },






}

module.exports=publika;

















