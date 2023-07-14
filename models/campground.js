const mongoose=require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema=new Schema({
    title:String,
    location:String,
    price:String,
    name:String,
    description:String,
    Image:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
});

CampgroundSchema.post('findOneandDelete',async function(doc){
    if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
    }
})

module.exports=mongoose.model('Campground', CampgroundSchema);