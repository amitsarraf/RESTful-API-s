const express = require("express");
const  mongoose = require("mongoose");
 const router = express.Router();
const Product = require("../models.js/product");
const multer = require("multer")

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./uploads/");
    },
    filename: function(req, file, cb){
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});
const fileFilter = (req, file, cb)=>{
//reject a file
if(file.mimetype === "image/jpeg"|| file.mimetype === "image/png"){
    cb(null, true);
} else{
    cb(null, false);
      }
};
const upload = multer({storage: storage, 
    limits:{
    fileSize: 1024 * 1024 *5
},
    fileFilter:fileFilter
});

 router.get("/",(req, res, next)=>{
     Product.find()
     .select("name price _id productImage")
     .exec()
     .then(docs=>{
        const response ={
            count: docs.length,
            products:docs.map(doc=>{
                return{
                    name: doc.name,
                    price: doc.price,
                    _id: doc._id,
                    productImage:doc.productImage,
                    request:{
                        type:"GET",
                        url:"http://localhost:3000/products/" + doc._id 
                    }
                }
            })
        }
        res.status(200).json(response);
     })
     .catch(err=>{
         console.log(err);
         res.status(500).json({
             error:err
         })
     })
 })
 router.post("/", upload.single("productImage"),(req, res, next)=>{
     const product = new Product ({
         _id:new mongoose.Types.ObjectId(),
         name: req.body.name,
         price: req.body.price,
         productImage: req.file.path,
     });
     product
     .save()
     .then(result=>{
         console.log(result);
         res.status(200).json({
            message: "posting requsts",
            createdProduct :{
                name: result.name,
                price: result.price,
                _id: result._id,
                request:{
                    type:"POST",
                    url:"http://localhost:3000/products/" + result._id 
                }
            }
        })
     })
     
     .catch(err => {
         console.log(err);
         res.status(500).json({
             error:err
         })
     })
    
   
});

router.get("/:productId",(req,res,next)=>{
    const id = req.params.productId;
   Product.findById(id) 
   .select("name price _id productImage")
   .exec()
   .then(doc=>{
       console.log("from database" , doc);
       if(doc){
       res.status(200).json({
           product: doc,
           request:{
            type:"GET",
            url:"http://localhost:3000/products/" 
        }

       })
       }else{
        res.status(404).json({
            message:"this is not a valid ID"
        }) 
       }
    
   })
   .catch(err=>{
       console.log(err);
       res.status(500).json({error:err})
   })
});

router.patch("/:productId",(req, res, next)=>{
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body){
        updateOps[ops.propName] = ops.value;
    
    }
    Product.update({_id: id}, {$set: updateOps})
    .exec()
    .then(result => {
        res.status(200).json({
            message:"product updated",
            request:{
                type:"UPDATE",
                url:"http://localhost:3000/products/" + id
            }
        })
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        })
    });
})



router.delete("/:productId",(req, res, next)=>{
    const id = req.params.productId;
    Product.remove({_id:id})
    .exec()
    .then(result =>{
        res.status(200).json({
            message:"Deleted Successfully",
            request:{
                type:"DELETE",
                url:"http://localhost:3000/products/",
                body:{name: "String", price:"Number"}
            }
        });
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({
            error:err
        })
    })
})
module.exports = router;