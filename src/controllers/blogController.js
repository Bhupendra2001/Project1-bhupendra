const blogModel = require("../Models/BlogModel")
const authorModel = require("../Models/AuthorModel")
const validation = require("../validation/validations")
const { validName, isvalidObjectid } = validation




const createdBlog = async function (req, res) 
{
        try{
        const data = req.body
        const { title, body, authorId, category } = data
        if(Object.keys(data).length == 0){
        return res.status(400).send({ status: false, msg: "All fields are mandatory" })
        }
        if(!title || !body || !authorId || !category) {
        return res.status(400).send({ status: false, msg: "All fields are mandatory" })
        }
        if(!validName(title)){
        return res.status(400).send({ status: false, msg: "title should be string type only" })
        }
        if(!validName(category)){
        return res.status(400).send({ status: false, msg: "category should be string type only" })
        }
        if(!validName(body)) {
        return res.status(400).send({ status: false, msg: "body should be string type only" })
        }
        if(!isvalidObjectid(authorId)){
        return res.status(404).send({ status: false, msg: "provide a valid author id" })
        }


        let checkauthorId = await authorModel.findById(authorId)
        if(!checkauthorId){
        return res.status(404).send({ status: false, msg: " author not found " })
        }
        let blogData = await blogModel.create(data)
        return res.status(201).send({ status: true, msg: "Blog has been created successfully", data: blogData })
        }
        catch (err){
        return res.status(500).send({ status: false, msg: err.message })
        }
}




const getBlogs = async function (req, res) {


        try {
            let { authorId, category, tags, subcategory } = req.query;
            let filter = { isDeleted: false, ispublished: true }
            if (authorId) { filter.authorId = authorId }
            if (req.query.authorId) {
            if (!isvalidObjectid(req.query.authorId)) {
            return res.status(400).send({ status: false, mas: "Please enter valid Author Id" })
            } else {
            req.query.authorId = authorId
            }
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
            
        

            let blogdata = await blogModel.find(filter)
            if (blogdata.length == 0) {
            return res.status(400).send({ status: false, msg: "No such blogs found" })
            }else{
            return res.status(200).send({ status: true, data: blogdata })
            }
            }catch(err){
            return res.status(500).send({ status: false, msg: err.message })
            }
    }
    

const updateblog = async function (req, res) 
{
        try{
        const data = req.body
        if (Object.keys(data).length == 0)
        return res.status(400).send({ status: false, msg: "All fields are mandatory" })
        const blogId = req.params.blogId

        if(!isvalidObjectid(blogId)){
                return res.status(404).send({msg : "invalid blogId"})
        }
        if(!blogId)
        return res.status(400).send({ status: false, msg: "BlogId is required"})
        const findblog = await blogModel.findById(blogId)

        if(!findblog){
          return res.status(404).send({msg : "blog not found"})
        }
        if(findblog.isDeleted == true){
        return res.status(404).send({ status: false, msg: "Blogs already deleted" })
        }
        const updatedblog = await blogModel.findOneAndUpdate(
        { _id: blogId },
        {
        $set:
        {
        title: data.title,
        body: data.body,
        category: data.category,
        publishedAt: new Date(),
        ispublished: true,
        },
        $push:
        { 
        tags: req.body.tags,
        subcategory: req.body.subcategory 
        }},{ 
        new: true,
        upsert: true
        })
        return res.status(200).send
        ({  
        status: true,
        data: updatedblog
        })
        }catch(err){
        return res.status(500).send({ status: false, msg: err.message })
        }
}




const deleteBlog = async function(req,res)
{
        try{
        const blogId = req.params.blogId
        if(!blogId){
        return res.status(404).send({ status: false, msg: "BlogId is required" })
        }
        const checkblogId = await blogModel.findById(blogId)
        if(!checkblogId )
        return res.status(404).send({status : false, msg : "not found"})

        if(checkblogId.isDeleted == true)
        {
        return res.status(400).send({status : false, msg : "blogs has been already deleted"})
        }
        const deletedBlogs = await blogModel.findOneAndUpdate({ 
        _id : blogId
        },{
        $set : 
        {
        isDeleted : true,
        DeletedAt : new Date()
        }},{    
        new : true
        })
        return res.status(200).send(
        {
        status : true,
        msg : "blog deleted successfully", data : deletedBlogs 
        })}catch{err}{
        return res.status(500).send({ status: false, msg: err.message })
        }

}




const deleteBlogbyquery = async function(req, res)
{
        try{
        const data = req.query
        const finddata = await blogModel.updateMany(data,{$set : { isDeleted : true, DeletedAt : new Date()}},{new : true})
        return res.status(200).send({status : true , msg : "successfully", data : finddata})
        }catch{err}{
        return res.status(500).send({ status: false, msg: err.message })
        }
}

























module.exports = { deleteBlog , createdBlog , getBlogs, updateblog ,deleteBlogbyquery}