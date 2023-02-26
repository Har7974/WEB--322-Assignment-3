/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Harmish Patel Student ID: 15456212  Date: 26/02/2023
*
*  Cyclic Web App URL: https://hat-ray.cyclic.app/
*
*  GitHub Repository URL: https://github.com/Har7974/WEB--322-Assignment-3
*
********************************************************************************/ 


const express = require("express");
const path = require('path');
const app = express();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
app.use(express.static(__dirname + '/public/css'));
const HTTP_PORT = process.env.PORT || 8080;

const { initialize, getAllPosts, getPublishedPosts, getCategories ,
    getPostById, getPostsByCategory, getPostsByMinDate, addPost} = require("./blog-service.js");

cloudinary.config({
    cloud_name: "df8ajrtcf",
    api_key: "557757641562671",
    api_secret: "W0IY3GZAqysfr-lzYd2D4erWIJM",
    secure: true,
  });
const upload = multer();

app.get('/', (req, res) => {
    res.redirect('/about')
});

app.get("/blog", (req, res) => {
    getPublishedPosts().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname + "/views/about.html"));
});



app.get("/posts", (req, res) => {
    if(req.query.category) {
        const category  = req.query.category
        getPostsByCategory(category).then((data) => {
            res.json({data});
        }).catch((err) => {
            res.json({message: err});
        })
    }
    else if(req.query.minDate) {
        const date = req.query.minDate
        getPostsByMinDate(date).then((data) => {
            res.json({data});
        }).catch((err) => {
            res.json({message: err});
        })
    }
    else {
        getAllPosts().then((data) => {
            res.json({data});
        }).catch((err) => {
            res.json({message: err});
        })
    }
});

app.get("/categories", (req, res) => {
    getCategories().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
});
app.get("/post/:value", (req, res) => {
    const value = req.params.value;
    getPostById(value).then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
});
app.get("/posts/add", (req, res) => {
    res.sendFile(path.join(__dirname + "/views/addPost.html"));
  })
app.post("/posts/add", upload.single("featureImage"), (req, res) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processPost(uploaded.url);
        });
    }else{
        res.send(err);
    }
    
    function processPost(imageUrl) {
        req.body.featureImage = imageUrl;
        let post = {};
        post.body = req.body.body;
        post.title = req.body.title;
        post.postDate = (new Date()).toISOString().slice(0,10);
        post.category = req.body.category;
        post.featureImage = req.body.featureImage;
        post.published = req.body.published;
        
        if (post.title) {
                addPost(post);
        }
        res.redirect("/posts");
    }
  });
app.use((req, res) => {
    res.status(404).end('404 PAGE NOT FOUND');
});

initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log('Express http server listening on port ' + HTTP_PORT);
    })
}).catch ((error) => {
    console.log(error);
});