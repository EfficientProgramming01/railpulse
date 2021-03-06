// grab the packages we need
require("dotenv").config()
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const { isModuleNamespaceObject } = require('util/types');

const app = express();
// Connection URL
const url = process.env.DATABASE //'mongodb://localhost:27017';
app.use(express.json()); // receive all in json format
app.use(express.urlencoded({extended:false}));
const port = process.env.PORT || 3000;
const db_name ="Coaches";
const collection_name ="coaches";
const thermal_image_collection ="thermal_image_collection";
let responses = null ;

let lteData = {}

// Create a new collection

 function createMyCollection(collection_name,db_name){

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(db_name);
        dbo.createCollection(collection_name, function(err, res) {
          if (err) throw err;
          console.log("Collection created!");
          db.close();
          console.log(res)
          return res
        });  
        
    });     

};


// connect to our mongodb database

let cashedClient = null;
let cashedDb = null

async function connectToDatabase(){

    MongoClient.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
      
      });

    const db = MongoClient.db(dbName);
    
    return db;

}


// create our route

app.get('/',async(req,res)=>{

    res.send('Welcome to Rail Pulse');
   
})


app.get('/data',async(req,res)=>{

  res.send(lteData);
 
})



app.get('/lte/:id',async(req,res)=>{  // here we get query string eg: localhost:3000/lte/:id?name=papy&age=15 WIL GIVE REPONSE {"name":"papy","age":"15"}

 // console.log(JSON.stringify(req.query))
 lteData = req.query
// res.status(200).send(JSON.stringify(req.query))
 MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(db_name);
    var myobj = {thermalImage:lteData,updatedAt:new Date,createdAt:new Date()};
    dbo.collection(thermal_image_collection).insertOne(myobj, function(err, resp) {
      if (err) throw err;
       res.send({resp})
      db.close();
      
    });
  });
 
})


app.put('/lte/:id',async(req,res)=>{  // here we get query string eg: localhost:3000/lte/:id?name=papy&age=15 WIL GIVE REPONSE {"name":"papy","age":"15"}

    // console.log(JSON.stringify(req.query))
    lteData = req.query
   // res.status(200).send(JSON.stringify(req.query))
    MongoClient.connect(url, function(err, db) {
       if (err) throw err;
       var dbo = db.db(db_name);
       var myobj = {thermalImage:lteData,updatedAt:new Date,createdAt:new Date()};
       dbo.collection(thermal_image_collection).insertOne(myobj, function(err, resp) {
         if (err) throw err;
          res.send({resp})
         db.close();
         
       });
     });
    
   })


app.get('/lte',async(req,res)=>{

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db(db_name);
      dbo.collection(thermal_image_collection).find({}).toArray(function(err, resp) {
        if (err) throw err;
        res.send({resp})
        db.close();
      });
    });
  })


  app.post('/lte',async(req,res)=>{
    const lteData = req.body  // DATA FORMAT eg: { "new_Data":{"thermalImage":["23.1","24.6","21.9"]}}
   console.log(lteData)
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db(db_name);
      var myobj = {thermalImage:lteData,updatedAt:new Date,createdAt:new Date()};
      dbo.collection(thermal_image_collection).insertOne(myobj, function(err, resp) {
        if (err) throw err;
         res.send({resp})
        db.close();
        
      });
    });

})





app.get('/mc',async(req,res)=>{

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(db_name);
    dbo.collection(collection_name).find({}).toArray(function(err, resp) {
      if (err) throw err;
      res.send({resp})
      db.close();
    });
  });
})

  // create


  app.post('/mc',async(req,res)=>{
    const new_Data = req.body.new_Data  // DATA FORMAT eg: { "new_Data":{"thermalImage":["23.1","24.6","21.9"]}}

 MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(db_name);
        var myobj = {thermalImage:new_Data.thermalImage,updatedAt:new Date,createdAt:new Date()};
        dbo.collection(collection_name).insertOne(myobj, function(err, resp) {
          if (err) throw err;
           res.send({resp})
          db.close();
          
        });
      });
}) 



app.put('/mc',async(req,res)=>{
    const query_Data = req.body.query_Data
    const new_Data = req.body.new_Data
   
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(db_name);
        var myquery = query_Data;
        var newvalues = { $set: new_Data };
        dbo.collection(collection_name).updateOne(myquery, newvalues, function(err, resp) {
          if (err) throw err;
          res.send({resp})
          db.close();
        
        });
      });
  
}) 


// Delete specific data in the database

app.delete('/mc',async(req,res)=>{
  const query_Data = req.body.query_Data
  MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db(db_name);
      var myobj = query_Data;
     dbo.collection(collection_name).deleteOne(myobj, function(err, resp) {
        if (err) throw err;
         res.send({resp})
        db.close();
        
      });
    });
}) 

app.delete('/lte/delete',async(req,res)=>{
  const query_Data = req.body.query_Data
  MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db(db_name);
      var myobj = query_Data;
     dbo.collection(thermal_image_collection).deleteMany({}, function(err, resp) {
        if (err) throw err;
         res.send({resp})
        db.close();
        
      });
    });
}) 

// create the server

app.listen(port,()=>{
    console.log("Our app is running on port",port)
    
})