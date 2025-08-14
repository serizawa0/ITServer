
import express, { NextFunction, Request, Response } from "express"
import { PrismaClient, Task } from "./generated/prisma"
import cors from 'cors'
import { log } from "node:console"
import { SubTask } from "../interfaces/TaskInterfaces"

import path from 'path'
import multer from "multer"
import { createServer } from "node:http"

import { Server as SocketIOServer } from 'socket.io'

import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => { 
    cb(null, path.join(__dirname, '../uploads')); // dossier uploads à créer manuellement
  },
  filename: (req, file, cb) => {
    // Renommage : timestamp + nom d'origine nettoyé (sans espaces, caractères spéciaux)
    const name = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const uniqueName = `${getToday()}_${name}`;
    cb(null, uniqueName);
  }
});

const getToday = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = (today.getMonth()+1).toString().padStart(2, '0')
  const day = today.getDate().toString().padStart(2,'0')
  return ''+year+''+month+''+day
}

const upload = multer({ storage });

const app = express()

const prisma = new PrismaClient()

const PORT = 3995

app.use(cors())
app.use(express.json())




type SubTaskNode = {
  id: string;
  title: string;
  done: boolean;
  taskId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  children: SubTaskNode[];
};

async function getSubTaskTree(parentId: string | null, taskId: string): Promise<SubTaskNode[]> {
  const subTasks = await prisma.subTask.findMany({
    where: {
      taskId,
      parentId,
    },
  });

  const children = await Promise.all(
    subTasks.map(async (sub) => ({
      ...sub,
      children: await getSubTaskTree(sub.id, taskId),
    }))
  );

  return children;
}

async function getTaskWithSubTasks(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) return null;

  const subTasks = await getSubTaskTree(null, taskId);

  return {
    ...task,
    subTasks,
  };
}


app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));


app.get('', (req, res) => {
    res.send('Connecté avec succès')
})

app.get('/getUsers', async (req,res) => {
    
    const users = await prisma.user.findMany()
    res.json(users)
})

app.get('/getItems', async (req,res) => {
    const items = await prisma.item.findMany()
    res.json(items)
})

app.post('/addItem', async (req,res) => {
    const item = req.body.libele
    console.log(item);
    
    const newItem = await prisma.item.create({
        data:{
            libele:item
        }
    })
    await prisma.action.create({data : {
        userId:1,
        itemId: newItem.id,
        desc:'enter'
    }})

    res.json({data:'okey'})
})

app.get('/getTask', async (req, res) => {
    try {
        const tasks = await prisma.task.findMany();

        const retour = await Promise.all(
        tasks.map(task => getTaskWithSubTasks(task.id))
        );
        console.log(retour);
        res.json(retour); // on renvoie au client la liste des tâches avec sous-tâches
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
})

async function getAllTasks(){
  try {
        const tasks = await prisma.task.findMany();

        const retour = await Promise.all(
          tasks.map(task => getTaskWithSubTasks(task.id))
        );
        console.log(retour);
        return retour // on renvoie au client la liste des tâches avec sous-tâches
    } catch (error) {
        console.error(error);
        return
    }
}

app.post('/dropTask', async (req,res) => {
  const id = req.body.id
  await prisma.task.delete({
    where:{
      id:id
    }
  })
  res.json({data:'okey'})
})

app.post('/addTask', async (req,res) => {
    const title = req.body.title
    await prisma.task.create({
        data:{
            title:title
        }
    })
    const tasks = await prisma.task.findMany()
    // io.emit('refreshTasks', { data:tasks })
    res.json(tasks)
})

app.post('/addSubTask', async (req,res) => {
    const title = req.body.title
    const taskId = req.body.taskId
    const parentId = req.body.parentId
    const deadLine = req.body.deadLine
    console.log(title+' '+taskId+' '+parentId);
    
    if(parentId){
        await prisma.subTask.create({
        data:{
            title:title,
            task:{ connect: {
                id: taskId
            } },
            parent: { connect:{
                id: parentId
            } },
            deadLine: deadLine
        }
        }
        
      ) 
    }
    else{
        await prisma.subTask.create({
            data:{
                title:title,
                task:{ connect: {
                    id:taskId
                } },
                deadLine: deadLine
            }
        })
    }
    res.json({ ret:'okey' })
})

app.post('/finishSubTask', async (req, res) => {
    const id = req.body.id
    const data = await prisma.subTask.update({
        where:{
            id:id
        },
        data:{
            done:true,
            endDate: new Date()
        }
    })
    res.json({ data:'okey'})
})

app.post('/dropSubtask', async (req, res) => {
  const id = req.body.id
  await prisma.subTask.delete({
    where:{
      id:id
    }
  })
  res.json({data:'okey'})
})

app.post('/getFiles', async (req,res) => {
  const subtaskId = req.body.subtaskId
  // console.log(subtaskId)
  const files = await prisma.file.findMany(
    {
      where:{
        subTaskId:subtaskId
      }
    }
  )
  res.json(files)
})

app.post('/download', async (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.body.filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath); // Force le téléchargement
  } else {
    res.status(404).send('Fichier non trouvé');
  }
});

app.post('/deleteFile', async (req, res) => {
  const id = req.body.id
  const fichier = await prisma.file.findUnique({
    where:{
      id: id
    }
  })
  if (fichier) {
   const filePath = path.join(__dirname, '../uploads', fichier.filename);
   fs.unlink(filePath, async (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).send({ message: 'Fichier non trouvé' });
      }
      return res.status(500).send({ message: 'Erreur lors de la suppression' });
    }
    else{
      await prisma.file.delete({
        where:{
          id:id
        }
      })
      res.send({ message: 'Fichier supprimé avec succès' });
    }
  }) 
  }
})

app.post('/uploadFiles', upload.array('files') ,async (req, res) => {
    const subtaskId = req.body.subtaskId
    const taskId = req.body.taskId
    const taskTitle = req.body.taskTitle
    console.log(req.body.subtaskId+' '+req.body.taskId+' '+taskTitle);
    
    try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ message: 'Aucun fichier reçu' });
    }

    const files = req.files as Express.Multer.File[];

    // On enregistre chaque fichier dans la base Prisma
    const savedFiles = await Promise.all(files.map(file =>
      prisma.file.create({
        data: {
          filename: file.filename,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
          subTask:{
            connect:{
                id:subtaskId
            }
          }
        },
        
      })
    ));
    res.json({ message: 'Fichiers uploadés et sauvegardés', files: savedFiles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }

})

app.post('/getCommentary', async (req, res) => {
  const subtaskId = req.body.subtaskId
  const commentaries = await prisma.commentary.findMany({
    where:{
      subtaskId:subtaskId
    },
    orderBy:{
      createdAt:"asc"
    }
  })
  res.json(commentaries)
})

app.post('/subCommentary', async (req,res)  => {
  const subtaskId = req.body.subtaskId
  const content = req.body.content
  const author = req.body.author
  await prisma.commentary.create({
    data:{
      content:content,
      subtaskId:subtaskId,
      author:author
    }
  })
  const commentaries = await prisma.commentary.findMany({
    where:{
      subtaskId:subtaskId
    },
    orderBy:{
      createdAt:"asc"
    }
  })
  res.json(commentaries)
})

app.post('/editCommentary', async (req,res)  => {
  const id = req.body.id
  const subtaskId = req.body.subtaskId
  const content = req.body.content
  const author = req.body.author
  await prisma.commentary.update({
    where:{
      id:id
    },
    data:{
      content:content,
      author:author
    }
  })
  const commentaries = await prisma.commentary.findMany({
    where:{
      subtaskId:subtaskId
    },
    orderBy:{
      createdAt:"asc"
    }
  })
  res.json(commentaries)
})

app.post('/deleteCommentary', async (req, res) => {
  const id = req.body.id
  await prisma.commentary.delete({
    where:{
      id:id
    }
  })
  res.json({data:'okey'})
})

const httpServer = createServer(app);

// Configuration Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [
      "http://localhost:4200",
      "http://192.168.1.175:4200"
    ],
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Client connecté :", socket.id);

  socket.on("message", (msg) => {
    console.log("Message reçu :", msg);
    // Répondre au client
    socket.emit("message-reponse", `Serveur a reçu : ${msg}`);
  });

  socket.on("disconnect", () => {
    console.log("Client déconnecté :", socket.id);
  });
  socket.on('launchRefresh',async () => {
    getAllTasks().then(data => {
      io.emit('refreshTasks', data)
    })
  })
});


httpServer.listen(PORT, ()=> {
    console.log('Serveur Express lancé sur http://localhost:'+PORT)
    console.log(getToday())
})