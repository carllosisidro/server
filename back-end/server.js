import express from "express";
import cors from "cors";
import fs from "fs";
import multer from "multer";
import { ObjectId } from "mongodb";
import { db } from "./connect.js";

const corsOptions = {
  origin: '*',  
  methods: ['GET', 'POST',  'PUT', 'DELETE'],
  optionsSuccessStatus: 200
}




const app = express();
app.use(express.json());
app.use(cors(corsOptions))
app.use("/uploads", express.static("uploads")); // permite acessar as imagens diretamente no navegador

// === GARANTIR QUE A PASTA UPLOADS EXISTE ===
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// === CONFIG MULTER ===
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// === ROTAS ===
app.get("/", (req, res) => {
  res.send("Servidor do InstaLike está rodando");
});

app.get("/posts", async (req, res) => {
  const posts = await db.collection("posts").find({}).toArray();
  res.status(200).json(posts);
});





app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const _id = new ObjectId();
    const descricao = req.body.descricao;
     const usuario = req.body.usuario;
    const imgUrl = `http://127.0.0.1:3000/uploads/${req.file.filename}`;
    const status = req.body.status;
    const horas = req.body.horas;

    const post = {
      _id,
      descricao,
      imgUrl,
      usuario,
      status,
      horas,
    };

    // insere no Mongo
    const result = await db.collection("posts").insertOne(post);

    res.status(200).json({
      insertedId: result.insertedId,
      descricao,
      imgUrl,
      status,
      horas,
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Falha no upload" });
  }
});

app.delete("/posts/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.collection("posts").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ erro: "Post não encontrado" });
    }
    res.status(200).json({ message: "Post apagado com sucesso" });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Falha ao apagar post" });
  }
});



app.put("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, usuario, status, horas } = req.body;

    const result = await db.collection("posts").updateOne(
      { _id: new ObjectId(id) },
      { $set: { descricao, usuario, status, horas } }
    );

    res.json({ message: "Post atualizado com sucesso", result });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar post" });
  }
});





app.listen(3000, () => {
  console.log("Servidor rodando em http://127.0.0.1:3000");
});
