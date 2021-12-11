const urlBase = "http://localhost:9090/api";
const modalLogin = document.getElementById("modalLogin");
const bsModalLogin = new bootstrap.Modal(
  modalLogin,
  (backdrop = "static")
); // Pode passar opções
const modalRegistar = document.getElementById("modalRegistar");
const bsModalRegistar = new bootstrap.Modal(
  modalRegistar,
  (backdrop = "static")
); // Pode passar opções

const btnModalLogin = document.getElementById("btnModalLogin");
const btnModalRegistar = document.getElementById("btnModalRegistar");
const btnLogoff = document.getElementById("btnLogoff");

modalLogin.addEventListener("shown.bs.modal", () => {
  document.getElementById("usernameLogin").focus();
});
btnModalLogin.addEventListener("click", () => {
  bsModalLogin.show();
});
btnModalRegistar.addEventListener("click", () => {
  bsModalRegistar.show();
});
btnLogoff.addEventListener("click", () => {
  localStorage.removeItem("token");
  document.getElementById("btnLogoff").style.display = "none";
  window.location.replace("index.html");
});

function validaRegisto() {
  let email = document.getElementById("usernameRegistar").value; // email é validado pelo próprio browser
  let senha = document.getElementById("senhaRegistar").value; // tem de ter uma senha
  const statReg = document.getElementById("statusRegistar");
  if (senha.length < 4) {
    document.getElementById("passErroLogin").innerHTML =
      "A senha tem de ter ao menos 4 carateres";
    return;
  }
  fetch(`${urlBase}/registar`, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
    body: `email=${email}&password=${senha}`,
  })
    .then(async (response) => {
      if (!response.ok) {
        erro = response.statusText;
        statReg.innerHTML = response.statusText;
        throw new Error(erro);
      }
      result = await response.json();
      console.log(result.message);
      statReg.innerHTML = result.message;
    })
    .catch((error) => {
      document.getElementById(
        "statusRegistar"
      ).innerHTML = `Pedido falhado: ${error}`;
    });
}

function validaLogin() {
  let email = document.getElementById("usernameLogin").value; // email é validado pelo próprio browser
  let senha = document.getElementById("senhaLogin").value; // tem de ter uma senha
  if (senha.length < 4) {
    document.getElementById("passErroLogin").innerHTML =
      "A senha tem de ter ao menos 4 carateres";
    return;
  }
  const statLogin = document.getElementById("statusLogin");

  fetch(`${urlBase}/login`, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST", // o login não vai criar nada, só ver se o user existe e a pass está correta
    body: `email=${email}&password=${senha}`,
  })
    .then(async (response) => {
      if (!response.ok) {
        erro = await(response.json())
        throw new Error(erro.msg);
      }
      result = await response.json();
      console.log(result.accessToken);
      const token = result.accessToken;
      localStorage.setItem("token", token);
      document.getElementById("statusLogin").innerHTML = "Sucesso!";
      document.getElementById("btnLoginClose").click();
    })
    .catch(async (error) => {
      statLogin.innerHTML = error
    });
}
async function getDisciplinas(id) {
    const urlBase = "http://localhost:9090/api/disciplinas";
    const listaDisciplinas = document.getElementById("listaDisciplinas");
    const criteria = document.getElementById("searchkey").value;
    console.log("Critério: " + criteria);
  
    let url = urlBase;
    const token = localStorage.token;
    console.log(token)
  
    if (id != "") {
      url = url + "/:" + id;
    } else if (criteria != "") {
      url = url + "/key/:" + criteria;
    }
  
    console.log("URL: " + url);
    const myInit = {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
    };
    const myRequest = new Request(url, myInit);
  
    await fetch(myRequest).then(async function (response) {
      if (!response.ok) {
        listaDisciplinas.innerHTML = "Não posso mostrar disciplinas de momento!";
      } else {
        disciplinas = await response.json();
        console.log(disciplinas);
        let texto = "";
        if (Object.keys(disciplinas).length == 1) {
          // Só retornou uma disciplina, detalhamos
          disciplina = disciplinas[0];
          texto += ` 
          <div>
            <h4>${disciplina.disciplina}</h4>
            &nbsp;&nbsp;&nbsp;${disciplina.curso} -- Ano: ${disciplina.ano}<br /> 
            &nbsp;&nbsp;&nbsp;Docente: ${disciplina.docente}
          </div>`;
        } else {
          // Retornou mais de uma disciplina
          for (const disciplina of disciplinas) {
            texto += ` 
            <div>
              <h4>${disciplina.disciplina}
              <button type="button" onclick="getDisciplinas('${disciplina._id}')">
                Clique aqui para detalhar esta disciplina
              </button></h4>
            </div>`;
          }
        }
        listaDisciplinas.innerHTML = texto;
      }
    });
  }
  