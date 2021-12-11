async function enviarRegisto() {
  const urlBase = "http://localhost:9090/api/disciplinas";
  const disc = document.getElementById("disc").value;
  const curs = document.getElementById("curs").value;
  const ano = document.getElementById("ano").value;
  const doce = document.getElementById("doce").value;
  const resultado = document.getElementById("resultado");
  const falhou = document.getElementById("falhou");

  if (disc == "" || doce == ""){
    falhou.innerHTML = "Deve informar os nomes da disciplina e do docente!";
    return;
  }

  var myInit = {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      disciplina: `${disc}`,
      curso: `${curs}`,
      ano: `${ano}`,
      docente: `${doce}`,
    }),
  };

  var myRequest = new Request(`${urlBase}`, myInit);

  await fetch(myRequest).then(async function (response) {
    if (!response.ok) {
      falhou.innerHTML = "Algo correu mal!";
    } else {
       resposta = await response.json();
       console.log(resposta.message);
       resultado.innerHTML = resposta.message;
    }
  });
}
