const express = require("express");
 const router = express.Router();
 const mongoose = require("mongoose");

 const Order = require("../models.js/order");
const Product = require("../models.js/product");

router.get("/",(req,res,next)=>{
   Order.find()
   .select("product quantity _id")
   .exec()
   .then(docs=>{
       res.status(200).json({
           count:docs.length,
           orders: docs.map(doc=>{
               return{
                   _id:doc._id,
                   product: doc.product,
                   quantity:doc.quantity,
                   request:{
                    type:"GET",
                    url:"http://localhost:3000/orders/" 
                }

               }
           })
           
       });
   })
   .catch(err=>{
       res.status(500).json({
           error:err
       })
   })
}) 
router.post("/",(req,res,next)=>{
    product.findById(req.body.productId)
    .then(product => {
        if(!product){
            return res.status(404).json({
                message:"product not found"
            })
        }
        const order = new Order({
            _id:new mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product:req.body.productId
        });
    
        return order.save();
    })
        .then(result=>{
            console.log(result);
            res.status(201).json({
                message:"Orders Stored",
                createdOrder:{
              _id: result._id,
              product:result.product,
              quantity:result.quantity
                },
                request:{
                    type:"POST",
                    url:"http://localhost:3000/orders/" 
                }
    
            });
        
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
    

}) 
router.get("/:orderId",(req,res,next)=>{
    Order.findById(req.params.orderId)
    .exec()
    .then(order=>{
        if(!order){
            return res.status(404).json({
                message:"Order not found"
            })
        }
     res.status(200).json({
         order: order,
         request:{
             type:"GET",
             url:"http://localhost:3000/orders" 
         }
     })
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
  
}) 
router.delete("/:orderId",(req,res,next)=>{
    Order.remove({_id:req.params.orderId}).exec()
    .then(result=>{
       res.status(200).json({
           message:"order Deleted",
           request:{
            type:"POST",
            url:"http://localhost:3000/orders" ,
            body:{productID: "ID", quantity:"Number"}
        }
       })
       
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
    
}) 

module.exports = router;