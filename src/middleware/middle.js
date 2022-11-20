const blogsModel = require("../Models/BlogModel")
const jwt = require('jsonwebtoken')
const {  isvalidObjectid } = require("../validation/validations")

const authentication=function(req,res,next)
{
    try{


    let token = req.headers["x-api-key"]
    if (!token) 
    return res.status(400).send({ status: false, msg: "Token must be present" })
    let decodedToken = jwt.verify(token, "project-1_group-13")
    if(!decodedToken) 
    return res.status(401).send({ status: false, msg: "Token is invalid" })
    req.token = decodedToken
    next()
    }catch(err){
    return res.status(500).send({msg : err.message})
    }
}

const authorization =  async function (req, res, next)
{
   
      try{
        let authorid=req.token.authorId

        if(req.params.blogId){

        if(!isvalidObjectid(req.params.blogId))
        return  res.status(400).send({status : false , msg : " Invalid blogId "})
            
        
        let blogId=req.params.blogId
        let blogData = await blogsModel.findById(blogId)
        if(!blogData){
            return  res.status(404).send({status : false , msg : "blog not found"})
        }
        let loggedAuthorId = blogData.authorId.toString()
        if(authorid !== loggedAuthorId) return res.status(403).send("ERROR : Unauthorized to perform this action")
        next()



        }else if(req.query){
        


        let { authorId, category, tags, subcategory , ispublished } = req.query;
        let filter = { isDeleted: false }
        if (authorId) { filter.authorId = authorId }
        if (req.query.authorId) {
        if (!isvalidObjectid(req.query.authorId)) {
        return res.status(400).send({ status: false, mas: "Please enter valid Author Id" })
        } else {
        req.query.authorId = authorid
        }
        }
        
        if(ispublished) 
        {
            ispublished = ispublished == 'true' ? true : false
            filter.ispublished = ispublished
        }


        if (category) { filter.category = category }


        if(tags) {
        if (tags.trim().length == 0){
        return res.status(400).send({Status:false, Msg:"Dont left the tag query empty"}) 
        }
        filter.tags={ $all: tags.trim().split(',').map(ele=>ele.trim())}
        }



        if (subcategory) {
            if(subcategory.trim().length == 0)
            return res.status(400).send({Status:false, Msg:"Dont left the subCategory query empty"}) 
            filter.subcategory =  { $all: subcategory.trim().split(',').map(ele=>ele.trim())}
        }


        let blogdata = await blogsModel.findOne(filter)
        if (blogdata.length == 0) {
        return res.status(400).send({ status: false, msg: "No such blogs found" }) }

        let loggedAuthorId= blogdata.authorId.toString()
        
        if(authorid !== loggedAuthorId) return res.status(403).send("ERROR : Unauthorized to perform this action")
        next()

        }
          
        }
     
    catch(err)
    {
        return res.status(500).send({status : false, msg : err.message})
    }
}

module.exports = { authentication, authorization}