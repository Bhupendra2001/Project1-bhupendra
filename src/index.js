const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route')
const {default : mongoose } = require('mongoose');
const blog = express();
blog.use(bodyParser.json());



mongoose.connect(
"mongodb+srv://bhupendra_:1B97GiRnjBfdXTL4@cluster5.fjlkdvr.mongodb.net/test" ,{  useNewUrlParser: true  }
).then(() => console.log( "MongoDb is connected" ) ).catch( err => console.log(err) )


blog.use('/', route)

blog.listen(process.env.PORT || 3000, function(){
console.log('Express app running on port ' + (process.env.PORT || 3000))
});