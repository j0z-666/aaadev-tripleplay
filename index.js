const express = require('express');
const axios = require('axios');
var exphbs  = require('express-handlebars');
const http = require('http');

var app = express();
server = http.createServer(app);

app.use(express.static('public'));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/citizenInfo', function(req, res) {

    if(req.query.id == undefined){
        res.send('Bad Request');
        console.log('El request no tiene id');
        return;
    }
    console.log("app get /citizenInfo, query id = " + req.query.id);

    axios.get('https://breeze2-196.collaboratory.avaya.com/services/AAADEVContextStore/cs/contexts/'+req.query.id)
    .then(function(resp){
        if(resp.data.data != undefined && resp.data.data.valid != undefined){
            let datos = resp.data.data;
            datos.jsonStr = JSON.stringify(datos, undefined, 4);
            res.render('ContextView', datos);
        } else {
            res.render('ContextView', {});
        }
    })
    .catch(function(error){
        console.log('Axios error: ' + error);
        res.render('ContextView', {});
    })
});

app.get('/makepayment', function(req, res){

    let cuenta = req.query.id;
    let context = req.query.contextid;

    return axios.get(`https://breeze2-196.collaboratory.avaya.com/services/AAADEVCPaaSWorkShopAPI/ws/usuarios/${cuenta}/numerodecuenta?cuenta=Tripleplay`)
    .then(function(resp){
        return axios.get(`https://breeze2-196.collaboratory.avaya.com/services/AAADEVContextStore/cs/contexts/${context}`)
        .then(function(resp1){
            let payload = {
                name: resp.data.usuario.nombre,
                account: cuenta,
                reference: context,
                code: resp1.data.data.numeroDeRecibo,
                date: resp1.data.data.fechaDePago,
                amount: resp1.data.data.montoDelPago
            }
            res.render('MakePayment', payload);
        })
        .catch(function(error1){
            
        });
    })
    .catch(function(error){
        
    });
});


var puertoApp = process.env.PORT || 8080;
server.listen(puertoApp, () => {

  console.log('Corriendo Server puerto ' + puertoApp);

});

module.exports = app;