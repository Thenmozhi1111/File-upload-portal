const express = require("express");
const pool = require("./db");
const bcrypt = require("bcrypt");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const paths = require("path");
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'file-upload-portal',
        resource_type: 'auto'
    }
});

const upload = multer({ storage });
const app = express();

app.use(express.json());
app.use(cors({
    origin: "https://file-upload-portal-one.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

const path = require("path");

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);



// Existing route
app.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json(result.rows);
    }
    catch(err){
        console.log(err);
    }
});


// Paste Step 3 HERE
app.post("/register", async (req, res) => {
  try {

    const { username, email, password} = req.body;

    const hashedPassword =
      await bcrypt.hash(password, 10);

     await pool.query(
      `INSERT INTO users
      (username,email,password,role)
      VALUES($1,$2,$3,$4)`,
      [username, email, hashedPassword,"user"]
    );

    res.status(201).json({
  message: "User Registered Successful",
});

  } catch(err) {
    console.log(err);

    res.status(500).json({
      message: "Registration Failed"
    });
    
  }
});

app.get(
  "/folder/:id",
  async(req,res)=>{

    try{

      const folder =
        await pool.query(
          `
          SELECT *
          FROM folders
          WHERE id=$1
          `,
          [req.params.id]
        );

      res.json(
        folder.rows[0]
      );

    }catch(err){

      console.log(err);

    }

});

app.post("/login", async (req, res) => {

  try {

    console.log("LOGIN REQUEST:", req.body);

    const { email, password } = req.body;

    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    console.log("USER:", user.rows);

    if (user.rows.length === 0) {
      return res.status(404).json({
        message: "User Not Found"
      });
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.rows[0].password
      );

    console.log("PASSWORD MATCH:", validPassword);

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid Credentials"
      });
    }

    console.log("LOGIN SUCCESS");

    res.status(200).json({
      message: "Login Successful",
      id: user.rows[0].id,
      username: user.rows[0].username,
      role: user.rows[0].role
    });

  } catch(err) {

    console.log("LOGIN ERROR:");
    console.log(err);

    res.status(500).json({
      message: "Login Failed"
    });

  }

});

app.post("/upload", upload.array("files"), async (req, res) => {
  console.log(req.files);
  const { folder_id,userId } = req.body;
  console.log("BODY:", req.body);
  console.log("FILE:", req.files);
try{
   console.log("USER ID:", userId);
console.log("FOLDER ID:", folder_id);
  for (const file of req.files) {
    await pool.query(
      
  `INSERT INTO files (filename, filesize, filetype, folder_id,userid,originalname)
       VALUES ($1, $2, $3, $4, $5,$6)`,
  [
    file.path,
    file.size,
    file.mimetype,
    folder_id || null,
    userId,
    originalname
  ]
);
  }

  res.json({ message: "Uploaded successfully" });

   }catch (err) {
  console.log("🔥 FULL UPLOAD ERROR:", err);
  console.log("🔥 MESSAGE:", err.message);
  console.log("🔥 DETAIL:", err.detail);

  return res.status(500).json({
    message: "Upload Failed",
    error: err.message,
    detail: err.detail,
  });
}

   

});

 app.get(
"/files/:userId/:role",
async(req,res)=>{

 const {
   userId,
   role
 } = req.params;

 let result;
 console.log("USER ID:", userId);


 if(role === "admin"){

   result =
   await pool.query(
   `
   SELECT
   files.*,
   users.username
   FROM files
   JOIN users
   ON files.userid=users.id
   `
   );

 }else{

   result =
   await pool.query(
   `
   SELECT
   files.*,
   users.username
   FROM files
   JOIN users
   ON files.userid=users.id
   WHERE files.userid=$1
   `,
   [userId]
   );

 }
 console.log("USER ID:", userId);

 res.json(
   result.rows
 );

});

app.delete(
 "/file/:id",
 async(req,res)=>{

 try {

      const { role, userId } = req.body;

      const fileResult =
        await pool.query(
          `
          SELECT *
          FROM files
          WHERE id = $1
          `,
          [req.params.id]
        );

      if (
        fileResult.rows.length === 0
      ) {
        return res.status(404).json({
          message: "File Not Found"
        });
      }

      const owner =
        fileResult.rows[0].userid;

      if (
        role !== "admin" &&
        owner != userId
      ) {
        return res.status(403).json({
          message: "Access Denied"
        });
      }

      await pool.query(
        `
        DELETE FROM files
        WHERE id = $1
        `,
        [req.params.id]
      );

      res.json({
        message: "File Deleted"
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message: "Delete Failed"
      });

    }

  }
);

app.get(
 "/download/:filename",
 (req,res)=>{

 const filePath =
 `uploads/${req.params.filename}`;

 res.download(filePath);

});

app.post(
  "/folder",
  async (req, res) => {

    try {

      const { name,parent_id } = req.body;
      
      const folder =
        await pool.query(
`
          INSERT INTO folders
          (name,parent_id)
          VALUES($1,$2)
          RETURNING *
          `,
          [name,parent_id || null]

        );

      res.json(folder.rows[0]);

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message: "Folder Creation Failed"
      });

    }

});

app.get(
  "/folders",
  async (req, res) => {

    try {

      const folders =
        await pool.query(
          "SELECT * FROM folders WHERE parent_id IS NULL"
        );

      res.json(
        folders.rows
      );

    } catch (err) {

      console.log(err);

    }

});

app.get(
  "/search/:term/:userId/:role",
  async (req, res) => {

    const { term, userId, role } = req.params;

    try {

      let files;

      if(role === "admin"){

        files = await pool.query(
          `
          SELECT
            files.*,
            users.username,
            folders.name AS folder_name
          FROM files
          LEFT JOIN folders
          ON files.folder_id = folders.id
          JOIN users
          ON files.userid = users.id
          WHERE files.filename ILIKE $1
          `,
          [`%${term}%`]
        );

      } else {

        files = await pool.query(
          `
          SELECT
            files.*,
            folders.name AS folder_name
          FROM files
          LEFT JOIN folders
          ON files.folder_id = folders.id
          WHERE files.filename ILIKE $1
          AND files.userid = $2
          `,
          [`%${term}%`, userId]
        );

      }

      res.json(files.rows);

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message: "Search Failed"
      });

    }

});

app.get("/folder-files/:id/:userId/:role", async (req, res) => {
  console.log("Route hit")
const {
  id,
   userId,
   role
 } = req.params;


  try {
    let result;

    if(role === "admin"){

      result = await pool.query(`
        SELECT files.*, users.username
FROM files
JOIN users ON files.userid = users.id
WHERE files.folder_id = $1
ORDER BY files.id DESC
      `,[id]);

    }
    else{
      result = await pool.query(`
       SELECT files.*, users.username
FROM files
JOIN users ON files.userid = users.id
WHERE files.folder_id = $1
AND files.userid = $2
ORDER BY files.id DESC
      `,[id,userId]);
    }
   
console.log("Folder ID:", id);
console.log("User ID:", userId);
console.log("Role:", role);

console.log(result.rows);
    res.json(result.rows);
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
});



app.put("/rename/:id", async (req, res) => {

  try {

    const { userId,role,id } = req.params;
    const { newName } = req.body;

    const fileResult = await pool.query(
      "SELECT * FROM files WHERE id = $1",
      [id]
    );
    const owner =
fileResult.rows[0].userId;

if(
 role !== "admin" &&
 owner != userId
){
 return res.status(403).json({
  message:"Access Denied"
 });
}
    

    if (fileResult.rows.length === 0) {
      return res.status(404).json({
        message: "File not found"
      });
    }

    const file = fileResult.rows[0];

    const oldPath = paths.join(
      __dirname,
      "uploads",
      file.filename
    );

    const extension = paths.extname(
      file.filename
    );

    const newFileName =
      newName + extension;

    const newPath = paths.join(
      __dirname,
      "uploads",
      newFileName
    );

    fs.renameSync(
      oldPath,
      newPath
    );

    await pool.query(
      `
      UPDATE files
      SET filename = $1
      WHERE id = $2
      `,
      [newFileName, id]
    );

    res.json({
      message: "File renamed successfully"
    });

  } catch (err) {
  console.error("Rename Error:", err);
  
  res.status(500).json({
    message: err.message
  });


  }

});

app.delete(
  "/folder/:id",
  async(req,res)=>{
  const {
   role,id
 } = req.params;

 
    try{

      const files =
        await pool.query(
          `
          SELECT *
          FROM files
          WHERE folder_id = $1
          `,
          [id]
        );

      if(files.rows.length > 0){

        return res.status(400).json({
          message:
          "Folder is not empty"
        });

      }

      await pool.query(
        `
        DELETE FROM folders
        WHERE id=$1
        `,
        [req.params.id]
      );

      res.json({
        message:"Folder Deleted"
      });

    }catch(err){

      console.log(err);

      res.status(500).json({
        message:"Delete Failed"
      });

    }

});

app.put(
  "/rename/folder/:id",
  async (req, res) => {
    console.log("rename clickes");

    try {

      const { id } = req.params;
      const{name,role}= req.body;
        await pool.query(
        `
        UPDATE folders
        SET name = $1
        WHERE id = $2
        `,
        [name, id]
      );

      res.json({
        message: "Folder Renamed"
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message: "Rename Failed"
      });

    }

});

app.put(
  "/move-file/:id",
  async(req,res)=>{

    try{

      const { folderId } =
        req.body;

      await pool.query(
        `
        UPDATE files
        SET folder_id = $1
        WHERE id = $2
        `,
        [
          folderId,
          req.params.id
        ]
      );

      res.json({
        message:
          "File Moved"
      });

    }catch(err){

      console.log(err);
    }

});

app.get(
"/subfolders/:id",
async(req,res)=>{

  try{

    const result =
    await pool.query(
      `
      SELECT *
      FROM folders
      WHERE parent_id = $1
      `,
      [req.params.id]
    );

    res.json(
      result.rows
    );

  }catch(err){

    console.log(err);

  }

});

app.get(
  "/breadcrumb/:id",
  async (req, res) => {

    try {

      let currentId =
        req.params.id;

      let breadcrumb = [];

      while (currentId) {

        const result =
          await pool.query(
            `
            SELECT *
            FROM folders
            WHERE id = $1
            `,
            [currentId]
          );

        if (
          result.rows.length === 0
        ) break;

        const folder =
          result.rows[0];

        breadcrumb.unshift(
          folder
        );

        currentId =
          folder.parent_id;
      }

      res.json(
        breadcrumb
      );

    } catch(err){

      console.log(err);

    }

});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
