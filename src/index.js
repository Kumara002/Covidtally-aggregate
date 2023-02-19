const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector')


app.get("/totalRecovered",async(req,res)=>{
    try{
        const data=await connection.aggregate([{$group:{_id:"total",recovered:{$sum:"$recovered"}}}])
        console.log(data)
        res.status(200).json({data})
    }catch(e){
        res.status(500).json({
            status:"error",
            message:e.message
        })
    }
})

app.get("/totalActive",async(req,res)=>{
try{
const data=await connection.aggregate([{$project:{recovered:1,infected:1,active:{$subtract:["$infected","$recovered"]}}},{$group:{_id:"total",active:{$sum:"$active"}}}]);
// const data=await connection.aggregate([{$group:{_id:"total",active:{$sum:"$active"}}}])
// const find=await connection.find()
console.log(sub)
res.status(200).json({
    data
})
}catch(e){
    res.status(500).json({
        status:"error",
        message:e.message
    })
}
})

app.get("/totalDeath",async(req,res)=>{
    try{
        const data=await connection.aggregate([{$group:{_id:"total",death:{$sum:"$death"}}}])
        console.log(data)
        res.status(200).json({
            data
        })
    }catch(e){
        res.status(500).json({
            status:"error",
            message:e.message
        })
    }
})

app.get("/hotspotStates",async(req,res)=>{
    try{
        const data=await connection.aggregate([{$project:{recovered:1,infected:1,state:1,hotspot:{$subtract:["$infected","$recovered"]}}},{$project:{hotspot:1,infected:1,state:1,rate:{$divide:["$hotspot","$infected"]}}},{$match:{rate:{$gt:0.1}}},{$project:{_id:0,state:1,rate:{$round:["$rate",5]}}}]);
        console.log(data)
        res.status(200).json({
            data
        })
    }catch(e){
        res.status(500).json({
            status:"error",
            message:e.message
        })
    }
})

app.get("/healthyStates",async(req,res)=>{
    try{
        const data=await connection.aggregate([{$project:{death:1,infected:1,state:1,mortality:{$divide:["$death","$infected"]}}},{$match:{mortality:{$lt:0.005}}},{$project:{_id:0,state:1,mortality:{$round:["$mortality",5]}}}]);
        console.log(data)
        res.status(200).json({
            data
        })
    }catch(e){
        res.status(500).json({
            status:"error",
            message:e.message
        })
    }
})

app.get("*",(req,res)=>{
    res.sendStatus(404)
})

app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;