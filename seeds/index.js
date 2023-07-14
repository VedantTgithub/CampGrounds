const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedhelper');
const Campground = require('../models/campground');
const axios=require('axios');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const sample = arr => arr[(Math.floor(Math.random() * arr.length))];


const seedDB = async () => {
    await Campground.deleteMany({});
   for(let i=0;i<50;i++)
   {
    const random1000=Math.floor(Math.random()*1000);

    const price=Math.floor(Math.random()*20)+10;
    const camp=new Campground({
        
        location:`${cities[random1000].city},${cities[random1000].state}`,
        description:'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Debitis, nihil tempora vel aspernatur quod aliquam illum! Iste impedit odio esse neque veniam molestiae eligendi commodi minus, beatae accusantium, doloribus quo!',
        price,
        Image:'https://random.imagecdn.app/500/150',
        
    })
    await camp.save();
   }          
}

seedDB().then(() => {
    mongoose.connection.close();
})