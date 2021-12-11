require("dotenv").config();

const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../models/nedb"); // Define o MODEL que vamos usar
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const restaurants = [
  {
    name: "burgerking",
    address: "https://fastfoodprecios.mx/burger-king-precos-portugal/",
    base: "",
  },
  {
    name: "mcdonalds",
    address: "https://fastfoodprecios.mx/mcdonalds-portugal-precos/",
    base: "",
  },
  {
    name: "kfc",
    address: "https://fastfoodprecios.mx/kfc-precos-portugal/",
    base: "",
  },
];
const menus = [];

// get menus
function getMenus() {
  restaurants.forEach((restaurant) => {
    axios.get(restaurant.address).then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      $('tr:contains("Menu")', html).each(function () {
        const title = $(this).text();

        const parts = title.split("\n", 4);
        const menuName = parts[1];
        const menuPrice = parts[2];

        menus.push({
          menuName,
          menuPrice,
          source: restaurant.name,
        });
      });
    });
  });
  return menus;
}

// autentifica o token
function authenticateToken(req, res) {
  console.log("A autorizar...");
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    console.log("Token nula");
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.email = user;
  });
}

const nodemailer = require("nodemailer");
const { response } = require("express");

// async..await não é permitido no contexto global
async function enviaEmail(recipients, URLconfirm) {
  // Gera uma conta do serviço SMTP de email do domínio ethereal.email
  // Somente necessário na fase de testes e se não tiver uma conta real para utilizar
  let testAccount = await nodemailer.createTestAccount();

  // Cria um objeto transporter reutilizável que é um transporter SMTP
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true para 465, false para outras portas
    auth: {
      user: testAccount.user, // utilizador ethereal gerado
      pass: testAccount.pass, // senha do utilizador ethereal
    },
  });

  // envia o email usando o objeto de transporte definido
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // endereço do originador
    to: recipients, // lista de destinatários
    subject: "Hello ✔", // assunto
    text: "Link to activate: " + URLconfirm, // corpo do email
    html: "<b>Link to activate: " + URLconfirm + "</b>", // corpo do email em html
  });

  console.log("Mensagem enviada: %s", info.messageId);
  // Mensagem enviada: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // A pré-visualização só estará disponível se usar uma conta Ethereal para envio
  console.log(
    "URL para visualização prévia: %s",
    nodemailer.getTestMessageUrl(info)
  );
  // URL para visualização prévia: https://ethereal.email/message/WaQKMgKddxQDoou...
}

// verificar
exports.verificaUtilizador = async (req, res) => {
  const confirmationCode = req.params.confirmationCode;
  db.crUd_ativar(confirmationCode);
  const resposta = { message: "O utilizador está ativo!" };
  console.log(resposta);
  return res.send(resposta);
};

// REGISTAR - cria um novo utilizador
exports.registar = async (req, res) => {
  console.log("Registar novo utilizador");
  if (!req.body) {
    return res.status(400).send({
      message: "O conteúdo não pode ser vazio!",
    });
  }
  try {
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    const email = req.body.email;
    const password = hashPassword;
    const confirmationToken = jwt.sign(
      req.body.email,
      process.env.ACCESS_TOKEN_SECRET
    );
    const URLconfirm = `http://localhost:9090/api/auth/confirm/${confirmationToken}`;
    db.Crud_registar(email, password, confirmationToken) // C: Create
      .then((dados) => {
        enviaEmail(email, URLconfirm).catch(console.error);
        res.status(201).send({
          message:
            "Utilizador criado com sucesso, confira sua caixa de correio para ativar!",
        });
        console.log("Controller - utilizador registado: ");
        console.log(JSON.stringify(dados)); // para debug
      });
  } catch {
    return res.status(400).send({ message: "Problemas ao criar utilizador" });
  }
};

// LOGIN - autentica um utilizador
exports.login = async (req, res) => {
  console.log("Autenticação de um utilizador");
  if (!req.body) {
    return res.status(400).send({
      message: "O conteúdo não pode ser vazio!",
    });
  }
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  const email = req.body.email;
  const password = hashPassword;
  db.cRud_login(email) //
    .then(async (dados) => {
      if (await bcrypt.compare(req.body.password, dados.password)) {
        const user = { name: email };
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
        res.json({ accessToken: accessToken }); // aqui temos de enviar a token de autorização
        console.log("Resposta da consulta à base de dados: ");
        console.log(JSON.stringify(dados)); // para debug
      } else {
        console.log("Password incorreta");
        return res.status(401).send({ erro: "A senha não está correta!" });
      }
    })
    .catch((response) => {
      console.log("controller:");
      console.log(response);
      return res.status(400).send(response);
    });
};

// My API
getMenus();
exports.getMenus = (req, res) => {
  res.json(menus);
};

exports.getRestaurant = (req, res) => {
  const restaurantId = req.params.restaurantId;

  const restaurantAddress = restaurants.filter(
    (restaurant) => restaurant.name == restaurantId
  )[0].address;

  axios
    .get(restaurantAddress)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const specificmenus = [];

      $('tr:contains("Menu")', html).each(function () {
        const title = $(this).text();

        const parts = title.split("\n", 4);
        const menuName = parts[1];
        const menuPrice = parts[2];
        specificmenus.push({
          menuName,
          menuPrice,
          source: restaurantId,
        });
      });
      res.json(specificmenus);
    })
    .catch((err) => console.log(err));
};
