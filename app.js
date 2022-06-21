const express = require('express')
var bodyParser = require('body-parser');
const cors = require('cors');
const serviceAccount = require('./firebaseConfig.json');
require('dotenv').config()
// console.log(process.env.PORT )

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const { async } = require('@firebase/util');


initializeApp({
    credential: cert(serviceAccount)
});

const port = process.env.PORT || 8000

const app = express()
const db = getFirestore();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', async (req, res) => {
    res.send("Hello Welcome to railway ticket system !")
})

app.get('/get', async (req, res) => {
    await db.collection('userTicket').get()
        .then(data => {
            const usersTicket = []
            data.forEach((doc) => {
                console.log(doc.data());
                usersTicket.push(doc.data())
            })
            res.send(JSON.stringify(usersTicket))
        })
        .catch(er => console.log(er))

})


app.post('/send', async (req, res) => {
    try {
        const body = req.body
        const name = body.name
        console.log("Name:", name)

        const ticketData = db.collection('userTicket');
        const snapshot = await ticketData.where('name', '==', name).get();
        if (snapshot.empty) {
            console.log('No matching documents.');
            const dRes = await db.collection('userTicket').add(body);
            console.log('Added document with ID: ', dRes.id);
            if (dRes.id) res.send(true)
            if (!dRes.id) {
                res.send(false)
            }

            return;
        }
        if (!snapshot.empty) {
            console.log('Data Exist');
            res.send(false)
        }

    } catch (error) {
        console.log("data send error", error)
    }

})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

