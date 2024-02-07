const express = require("express");
const { Client } = require('pg');
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

var conString = config.urlConnection;
var client = new Client(conString);
client.connect((err) => {
    if (err) {
        return console.error('Não foi possível conectar ao banco.', err);
    }
    client.query('SELECT NOW()', (err, result) => {
        if (err) {
            return console.error('Erro ao executar a query.', err);
        }
        console.log(result.rows[0]);
    });
});

app.get("/", (req, res) => {
    console.log("Response ok.");
    res.send("Rotas: \n " + "/clientes -> para listar os usuários. \n" + "/clientes/id -> para listar um cliente pelo código do id asdhgasidgbasidas\n");
});


//parte dos clientes

app.get("/clientes", (req, res) => {
    try {
        client.query("SELECT * FROM clientes", function
            (err, result) {
            if (err) {
                return console.error("Erro ao executar a qry de SELECT", err);
            }
            res.send(result.rows);
            console.log("Chamou get clientes");
        });
    } catch (error) {
        console.log(error);
    }
});

app.get("/clientes/:id", (req, res) => {
    try {
        console.log("Chamou /:id " + req.params.id);
        client.query(
            "SELECT * FROM clientes WHERE id = $1",
            [req.params.id],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de SELECT id", err);
                }
                if (result.rows.length == 0) {
                    res.send("O cliente com o código: " + req.params.id + "não existe no banco de dados.")
                }
                else {
                    res.send(result.rows);
                    //console.log(result);
                }
            }
        );
    } catch (error) {
        console.log(error);
    }
});

app.delete("/clientes/:id", (req, res) => {
    try {
        console.log("Chamou delete /:id " + req.params.id);
        const id = req.params.id;
        client.query(
            "DELETE FROM clientes WHERE id = $1",
            [id],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de DELETE", err);
                } else {
                    if (result.rowCount == 0) {
                        res.status(404).json({ info: "Registro não encontrado." });
                    } else {
                        res.status(200).json({ info: `Registro excluído. Código: ${id}` });
                    }
                }
                console.log(result);
            }
        );
    } catch (error) {
        console.log(error);
    }
});

app.post("/clientes", (req, res) => {
    try {
        console.log("Alguém enviou um post com os dados:", req.body);
        const { nome, email, telefone, cpf, rg, estadocivil, nascimento, endereco} = req.body;
        client.query(
            "INSERT INTO clientes (nome, email, telefone, cpf, rg, estadocivil, nascimento, endereco) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING * ",
            [nome, email, telefone, cpf, rg, estadocivil, nascimento, endereco],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de INSERT", err);
                }
                const { id } = result.rows[0];
                res.setHeader("id", `${id}`);
                res.status(201).json(result.rows[0]);
                console.log(result);
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});

app.put("/clientes/:id", (req, res) => {
    try {
        console.log("Alguém enviou um update com dados", req.body);
        const id = req.params.id;
        const { usuario, email, senha, cpf, rg, estadocivil, nascimento, endereco } = req.body;
        client.query(
            "UPDATE clientes SET nome=$1, email=$2, senha=$3, cpf=$4, rg=$5, estadocivil=$6, nascimento=$7, endereco=$8 WHERE id =$9 ",
            [usuario, email, senha, id, cpf, rg, estadocivil, nascimento, endereco],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de UPDATE", err);
                } else {
                    res.setHeader("id", id);
                    res.status(202).json({ "id": id });
                    console.log(result);
                }
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});

app.listen(config.port, () =>
    console.log("Servidor funcionando na porta " + config.port)
);

module.exports = app;