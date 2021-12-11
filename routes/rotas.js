module.exports = (app) => {
  const controlador = require("../controllers/controller.js");

  var router = require("express").Router();

  // Cria um novo registo
  router.post("/disciplinas", controlador.create);

  // Cria um novo utilizador
  router.post("/registar", controlador.registar);

  // Rota para login - tem de ser POST para não vir user e pass na URL
  router.post("/login", controlador.login);

  // Rota para verificar e ativar o utilizador
  router.get("/auth/confirm/:confirmationCode", controlador.verificaUtilizador);

  // Envia lista de disciplinas e docentes associados
  router.get("/disciplinas/", controlador.findAll);

  // Busca uma disciplina pelo id
  router.get("/disciplinas/:id", controlador.findOne);

  // Busca todas as disciplinas com uma chave de pesquisa
  router.get("/disciplinas/key/:id", controlador.findKey);

  // Update a Tutorial with id
  router.put("/disciplinas/:id", controlador.update);

  // Delete a Tutorial with id
  router.delete("/disciplinas/:id", controlador.delete);

  // Create a new Tutorial
  router.delete("/disciplinas", controlador.deleteAll);

  app.use("/api", router);

  //My API
  router.get("/fastfood", controlador.getMenus);

  router.get("/fastfood/:restaurantId", controlador.getRestaurant);

  app.use("/", router);
};
