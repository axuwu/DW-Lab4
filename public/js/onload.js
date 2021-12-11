window.onload = () => {
  (async () => {
    const urlBase = "http://localhost:9090/api/disciplinas";
    const listaDisciplinas = document.getElementById("listaDisciplinas");
    let texto = "";
    var myHeaders = new Headers();

    var myInit = { method: "GET", headers: myHeaders };

    var myRequest = new Request(`${urlBase}`, myInit);

    await fetch(myRequest).then(async function (response) {
      if (!response.ok) {
        listaDisciplinas.innerHTML =
          "Não posso mostrar disciplinas de momento!";
      } else {
        disciplinas = await response.json();
        console.log(disciplinas);
        for (const disciplina of disciplinas) {
          texto += ` 
                <div>
            <h4>${disciplina.disciplina}</h4>
            &nbsp;&nbsp;&nbsp;Docente: ${disciplina.docente}
        </div>`;
        }
        listaDisciplinas.innerHTML = texto;
      }
    });
  })();
}

