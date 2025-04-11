const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser'); 
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path')

const app = express();
const PORT = 5000;
const SECRET_Key = 'i_am_hero';

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'semmozhi9944191756',
    database:'socialapp'
})

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./Post_images/');
    }
    ,
    filename: (req,file,cb)=>{
        const uniqueSuffix = Date.now()+'-'+Math.round(Math.random()*1E9);
        cb(null,uniqueSuffix+path.extname(file.originalname));
    }
});

const upload = multer({storage:storage});

app.use('/Post_images', express.static(path.join(__dirname, 'Post_images')));

db.connect(err =>{
    if(err) throw err;
    console.log("MySQL Connected...");
})


app.post('/api/register',async(req,res)=>{
    const {username,email,password,role} = req.body;
    const updated_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    // if(userExists) return res.status(400).json({msg:'User already exists'});
    const [rows] = await db.promise().query("select * from users where email=?",[email]);
    if(rows.length>0) return res.status(400).json("user already exists");
    const hashedPassword = await bcrypt.hash(password,10);
    console.log(hashedPassword)
    // users.push({username:username,password:hashedPassword,role:role});
    try{
        await db.promise().query("insert into users(username,email,password,role,updated_date) values(?,?,?,?,?)",[username,email,hashedPassword,role,updated_date])
        res.json({msg:"registered successfully"});
    }catch(err){
        console.log(err);
        res.status(500).json({msg:"server error"});
    }
});

app.post('/api/login',async(req,res)=>{
    const {email,password} = req.body;
    const [rows] = await db.promise().query("select * from users where email=?",[email]);
    if(rows.length<=0) return res.status(400).json({msg:'user not exist'});
    const user = rows[0];
    const match = await bcrypt.compare(password,user.password);
    if(!match) return res.status(400).json({msg:'Invalid credentials'});
    const token = jwt.sign({user_id:user.id,username:user.email,password:user.password,role:user.role},SECRET_Key,{expiresIn:'1h'});
    res.json({token});
})

const verifyToken =(req,res,next)=>{
    const token = req.headers['authorization'];
    if(!token) return res.status(403).json({msg:'No token provided'});

    try{
        const decoded = jwt.verify(token,SECRET_Key);
        req.user = decoded;
        next();
    }catch{
        res.status(401).json({msg:'Invalid token'});
    }
};

app.post('/api/create-post',verifyToken,upload.single('image'),async(req,res)=>{
    const user_id = req.user.user_id;
    const {title,content} = req.body;
    const image = req.file?req.file.filename:null;
    try{
    await db.promise().query('Insert into posts(user_id,title,content,image_url) values(?,?,?,?)',[user_id,title,content,image]);
    res.json({msg:"post created successfully"});
    }catch(err){
        res.status(500).json({msg:"server error"});
    }
})

app.get('/api/feeds',verifyToken,async(req,res)=>{
    try{
        const feeds = await db.promise().query('SELECT posts.id,posts.title,posts.content,posts.image_url,posts.created_at,users.username,COUNT(likes.id) AS like_count FROM posts JOIN users ON posts.user_id = users.id LEFT JOIN likes ON likes.post_id = posts.id GROUP BY posts.id, posts.title, posts.content, posts.created_at, users.username ORDER BY posts.created_at DESC');
        res.json(feeds[0])
    }catch(err){
        res.status(500).json({msg:"server error"});
    }
})

app.get('/api/search-posts',verifyToken,async(req,res)=>{
    const {q} = req.query;
    try{
        const [result] = await db.promise().query("select * from posts where title like ? or content like ?",[`%${q}%`,`%${q}%`]);
        res.json(result);
    }catch(err){
        res.status(500).json({msg:"server error"})
    }
})

app.get('/api/user-profile/:id',verifyToken,async(req,res)=>{
    const user_id = req.params.id;
    try{
       const [user] = await db.promise().query('select * from users where id=?',[user_id]);
       if(user.length==0){
        return res.status(404).json({msg:"user not found"});
       }
       const user_posts = await db.promise().query('select * from posts where user_id=?',[user_id]);
       res.json({user_detail:user[0],user_posts:user_posts[0]});
    }catch(err){
        res.status(500).json({msg:"server error"});
    }

})

app.delete('/api/delete-post/:id',async(req,res)=>{
    const id = req.params.id;
    try{
        await db.promise().query("delete from posts where id=?",[id]);
        res.json({msg:"post deleted successfully"});
    }catch(err){
        res.status(500).json({msg:"server error"});
    }
})

app.get('/api/users',verifyToken,async(req,res)=>{
    const role = req.user.role;
    if(role=='admin'){
        const [result]= await db.promise().query('select * from users where role=?',['user']);
        res.json(result);
    }else{
        res.json({msg:"access denied"});
    }
})

app.get("/api/search-users/:search",verifyToken,async(req,res)=>{
    const search = req.params.search;
    try{
    const [result] = await db.promise().query('select * from users where username like ? or email like ?',[`%${search}%`,`%${search}%`]);
    res.json(result)
    }catch(err){
        res.status(500).json({msg:"server error"});
    }
})

app.delete('/api/delete-user/:id',async(req,res)=>{
    const id = req.params.id;
    try{
    await db.promise().query('delete from users where id=?',[id]);
    res.json({msg:"user deleted successfully"});
    }catch(err){
        res.status(500).json({msg:"server error"})
    }

})

app.post('/api/like/:id',verifyToken,async(req,res)=>{
    const post_id = req.params.id;
    const user_id = req.user.user_id;
    try{
        const [result] = await db.promise().query('select * from likes where user_id=? and post_id=?',[user_id,post_id]);
        if(result.length>0){
            await db.promise().query('delete from likes where user_id=? and post_id=?',[user_id,post_id]);
        }else{
            await db.promise().query('insert into likes(user_id,post_id) values(?,?)',[user_id,post_id]);
        }
    }
    catch(err){
        res.json({msg:"server error"})
    }
})

app.get('/api/feed/:id',verifyToken,async(req,res)=>{
    const id = req.params.id;
    try{
        const [result] = await db.promise().query('SELECT posts.id,posts.title,posts.content,posts.created_at,posts.image_url,users.username,COUNT(likes.id) AS like_count FROM posts JOIN users ON posts.user_id = users.id LEFT JOIN likes ON likes.post_id = posts.id where posts.id=? GROUP BY posts.id, posts.title, posts.content, posts.created_at, users.username',[id]);
        res.json(result[0]);
    }catch(err){
        res.json({msg:"server error"});
    }
})

app.post('/api/post-comment/:id',verifyToken,async(req,res)=>{
    const post_id = req.params.id;
    const user_id = req.user.user_id;
    const {content}= req.body;
    // console.log(content,post_id,user_id)
    try{
        await db.promise().query('insert into comments(user_id,post_id,content) values(?,?,?)',[user_id,post_id,content]);
        res.json({msg:"comment posted successfully"});
    }catch(err){
        console.log(err)
        res.status(500).json({msg:"server error"});
    } 
})

app.get('/api/comments/:id',verifyToken,async(req,res)=>{
    const post_id = req.params.id;
    try{
        const results = await db.promise().query('select comments.*,users.username from comments join users on comments.user_id = users.id where post_id=?',[post_id]);
        res.json(results[0]);
        console.log(results[0])
    }
   catch(err){
    res.status(500).json({msg:"server error"})
   }
})

app.listen(PORT,()=>console.log(`Backend running on http://localhost:${PORT}`));