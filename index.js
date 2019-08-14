let axios = require('axios');
let e =  require('express');

let configs = require('./config');

/// start up
// health object
let health = {
    name: 'particleaccelerator',
    status: 'startup',
    msg: ''
};

// q setup
var qlock = 0;
let q = [];

// create consumer
/*setInterval(() => {
    // retrieve lock
    while (true) {
        if (qlock == 0) {
            qlock++;
            break;
        } else if (qlock == 1) {
            continue;
        } else {
            throw 'deadlock';
        }
    }

    let qe = [];
    for (var i = 0; i < 100; i++) {
        qe.push(q.shift());
    }
    /*let qe = Array.from(q);
    q = [];*/
    // release lock
    /*qlock--;

    // process q items
    if (qe.length > 0) {
        for (var i = qe.shift(); i != undefined; i = qe.shift()) {

            let p = i;

            axios.post(p.endpoint, { data: p.data })
                .then((rdata) => {
                    axios.post(p.return.success, { rdata: rdata.data });
                })
                .catch((err) => {
                    axios.post(p.return.fail, { rdata: p.data, err });
                });
        }
    } else {
        // console.log('empty beat');
    }

}, 2000);*/


let app = e();

// uses
app.use(e.json());

// gets
app.get('/health', (req, res) => {
    res.json(health);
});

app.post('/outbox', (req, res) => {
    if (health.status != 'listening') {
        res.status(503).json('bad.health.status');
        return;
    }

    let { particle } = req.body;
    if (!particle) {
        res.json('particle.missing');
        return;
    }

    // validate particle
    // here

    // retrieve lock
    while (true) {
        if (qlock == 0) {
            qlock++;
            break;
        }
    }
    q.push(particle);
    // release lock
    qlock--;

    res.json('particle.received');
});

// kill and rez
app.post('/poison', (req, res) => {
    health.status = 'poisoned';
    health.msg = 'app poisoned';
    
    res.json('app.poison');
});

app.post('/replenish', (req, res) => {
    health.status = 'listening';
    health.msg = `listening on port [${configs.port}]`;
    
    res.send('app.replenish');
})

app.listen(configs.port, () => { 
    health.status = 'listening';
    health.msg = `listening on port [${configs.port}]`;
});
