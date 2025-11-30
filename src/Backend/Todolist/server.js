const express = require('express');
const app =express();
const cors = require("cors")
const bodyParser = require("body-parser")
const mysql = require('mysql2');
// const path = require("path");

const port = 3000;

app.use(bodyParser.json())
app.use(cors())

const db = mysql.createConnection({
    host:"localhost",
    user:"gireendra",
    password:"Giri@332",
    database:"todo"
})


db.connect((err)=>{
    if(err){
        console.log("error while connecting to database", err);
        return 
    }
    console.log("connected to the mysql database...")
})


const todos = [{
    id:1,
    text:"never ever give up",
    edit: false,
},{
    id:2,
    text:"sometimes u can give up",
    edit: false,
}]



app.get("/todos",(req,res)=>{
    res.send(todos)
});

app.get("/todos/:id",(req,res)=>{
    // console.log(req.params);
    // try{
           const each = todos.find((todo)=>{
            return todo.id == req.params.id
        })
  if (!each) {
    return res.status(404).send("<h1>element not found</h1>");
  }
        res.json(each)
    // }catch(err){
    //     res.send("no data found as required",err)
    // }
})

app.get("/dbcheck",(req,res)=>{
    console.log("getting data from db");
    db.query(`select * from todoItems`,(err,result)=>{
        if(err){
            console.log("getting data from db got failed")
            return;
        }
        console.log("result u got is ", result);

        res.send(result);
    })

})

app.post("/todos",(req,res)=>{
    console.log(req.body);

    const newTodo = req.body;
    todos.push(newTodo)
    res.send(todos)
})

app.post("/dbcheck",(req,res)=>{
   
    console.log(req.body);

    db.query(`insert into todoItems(itemDescription,completed) values('${req.body.itemDescription}','${req.body.complete}')`,(err,result)=>{
        if(err){
            console.log("cant push the data into db",err);
            return;
        }

        res.send(result)
    })
});

app.put("/todos/:id",(req,res)=>{
    
    const idx = todos.findIndex((each)=>{
        return each.id == req.params.id
    })

    const edit =  {...todos[idx],"text":req?.body?.text,"edit":req.body.edit}


    todos[idx] = edit
    console.log(todos);
    res.send(todos);
})

app.delete("/todos/:id",(req,res)=>{
    
    console.log(req.params.id)

   const idx= todos.findIndex((each)=>{
        return req.params.id == each.id;
    })
    console.log(idx);
    todos.splice(idx,1)
   res.send(todos);
})


app.listen(port,()=>{
    console.log("app is running on port",port,".....");
});

 

// ============= END AUTHENTICATION ENDPOINTS =============


// ============= OLD CODE (IN-MEMORY TODOS) - COMMENTED OUT =============
// const todos = [{
//     id:1,
//     text:"never ever give up",
//     edit: false,
// },{
//     id:2,
//     text:"sometimes u can give up",
//     edit: false,
// }]

// app.get("/todos",(req,res)=>{
//     res.send(todos)
// });

// app.get("/todos/:id",(req,res)=>{
//     // console.log(req.params);
//     // try{
//            const each = todos.find((todo)=>{
//             return todo.id == req.params.id
//         })
//   if (!each) {
//     return res.status(404).send("<h1>element not found</h1>");
//   }
//         res.json(each)
//     // }catch(err){
//     //     res.send("no data found as required",err)
//     // }
// })
// ============= END OLD CODE =============




// ============= OLD CODE (IN-MEMORY ONLY) - COMMENTED OUT =============
// app.put("/todos/:id",(req,res)=>{
//     
//     const idx = todos.findIndex((each)=>{
//         return each.id == req.params.id
//     })

//     const edit =  {...todos[idx],"text":req?.body?.text,"edit":req.body.edit}


//     todos[idx] = edit
//     console.log(todos);
//     res.send(todos);
// })
// ============= END OLD CODE =============


// ============= OLD CODE (IN-MEMORY ONLY) - COMMENTED OUT =============
// app.delete("/todos/:id",(req,res)=>{
//     
//     console.log(req.params.id)

//    const idx= todos.findIndex((each)=>{
//         return req.params.id == each.id;
//     })
//     console.log(idx);
//     todos.splice(idx,1)
//    res.send(todos);
// })
// ============= END OLD CODE =============




// ============= OLD CODE (SQL INJECTION VULNERABLE) - COMMENTED OUT =============
// app.post("/todos",(req,res)=>{
//     console.log(req.body);

//     const newTodo = req.body;
//     todos.push(newTodo)
//     res.send(todos)
// })

// app.post("/dbcheck",(req,res)=>{
//    
//     console.log(req.body);

//     db.query(`insert into todoItems(itemDescription,completed) values('${req.body.itemDescription}','${req.body.complete}')`,(err,result)=>{
//         if(err){
//             console.log("cant push the data into db",err);
//             return;
//         }

//         res.send(result)
//     })
// });
// ============= END OLD CODE =============

// ============= UPDATE TODO IN DATABASE (NEW - SAFE WITH PREPARED STATEMENTS) =============



// ============= OLD ENDPOINT (FETCHES ALL TODOS) - COMMENTED OUT =============
// app.get("/todos", (req, res) => {
//     console.log("Fetching all todos from database...");
//
//     db.query(`SELECT * FROM todoItems ORDER BY createdAt DESC`, (err, result) => {
//         if (err) {
//             console.error("Error fetching todos from db:", err);
//             return res.status(500).json({ error: "Failed to fetch todos" });
//         }
//         console.log("Todos fetched successfully:", result);
//         res.json(result);
//     });
// });
// ============= END OLD ENDPOINT =============

// ============= OLD CODE (UNSTRUCTURED) - COMMENTED OUT =============
// app.get("/dbcheck",(req,res)=>{
//     console.log("getting data from db");
//     db.query(`select * from todoItems`,(err,result)=>{
//         if(err){
//             console.log("getting data from db got failed")
//             return;
//         }
//         console.log("result u got is ", result);

//         res.send(result);
//     })
// })
// ============= END OLD CODE =============

// ============= ADD NEW TODO TO DATABASE (SAFE WITH PREPARED STATEMENTS) =============