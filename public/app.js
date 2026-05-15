const form = document.getElementById("artist-form");
const loadButton = document.getElementById("load-btn");
const artistOutput = document.getElementById("artist-output");

const dropdownDeleteArtist = document.getElementById("dropdownDeleteArtist");
const DeleteArtistbtn = document.getElementById("delete-btn");
const artistNameInput = document.getElementById("artist-name");
const loadAlbumbtn = document.getElementById("load-album-btn");
const albumOutput = document.getElementById("album-output");
const loadSongbtn = document.getElementById("load-song-btn");
const songOutput = document.getElementById("song-output");
const dropdownModifyArtist = document.getElementById("dropdownModifyArtist");
const ModifyButton = document.getElementById("modify-btn");
const artistNewNameInput = document.getElementById("artist-new-name");


form.addEventListener("submit", async (event) => {
  event.preventDefault();//per defecte recarregaria la pagina així que evitem això.

  const name = artistNameInput.value.trim();
  if (!name) return;

  const res = await fetch("/api/AddArtist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ data: name })
  });

  const message = await res.text();
  artistOutput.textContent = message;
  if (res.ok) form.reset();
});

loadButton.addEventListener("click", async () => {

  let text = "text a enviar en aquest cas la taula";
  text = "artists";
  // Fem una petició HTTP al servidor (Express)
  // fetch() envia una request al backend
  const res = await fetch("/api/artists", {
    // Tipus de petició
    // POST = enviem dades al servidor
    method: "POST",
    // Capçaleres HTTP
    // Indiquem que estem enviant dades en format JSON
    headers: {
      "Content-Type": "application/json"
    },

    // Cos de la petició (les dades que enviem)
    // Convertim l’objecte JS a text JSON
    body: JSON.stringify({ data: text })
  });

  // El servidor respon amb JSON
  const json = await res.json();
  // Mostrem el resultat a la textarea de sortida
  artistOutput.textContent = JSON.stringify(json.result, null, 2);

});

dropdownDeleteArtist.addEventListener("focus", async () => {
  await LoadDeleteArtistDropdown();
});

DeleteArtistbtn.addEventListener("click", async (event) => {
  const name = dropdownDeleteArtist.value;
  if (!name) {
    artistOutput.textContent = "Selecciona un artista abans d'eliminar.";
    return;
  }
  const res = await fetch("/api/RemoveArtist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: name })
  });
  const message = await res.text();
  artistOutput.textContent = message;
  if (res.ok) {
    await LoadDeleteArtistDropdown();
  }
});

loadAlbumbtn.addEventListener("click", async () => {
  const text = 'album';
  const res = await fetch("/api/album",{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: text })
  });
  const json = await res.json();
  albumOutput.textContent = JSON.stringify(json.result, null, 2);
});

loadSongbtn.addEventListener("click", async () =>{
  const text = 'song';
  const res = await fetch("/api/song",{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: text })
  });
  const json = await res.json();
  songOutput.textContent = JSON.stringify(json.result, null, 2);
});
// FUnció per modificar un registre
dropdownModifyArtist.addEventListener("focus", async () =>{
  await LoadModifyArtistDropdown();
});

ModifyButton.addEventListener("click", async () => {
  const name = dropdownModifyArtist.value;
  const newname = artistNewNameInput.value.trim();
  const res = await fetch ("/api/modifyArtist",{
    method: "POST",

    headers:{
      "Content-type":"application/json"
    },
    body: JSON.stringify({old_name: name, new_name: newname})
  });

  const message = await res.text();
  artistOutput.textContent = message;
  if (res.ok) {
    artistNewNameInput.value = "";
    await LoadModifyArtistDropdown();
    await LoadDeleteArtistDropdown();
  }
});







async function ConsultTable(tableString, campString) {// Consulta de qualsevol taula  amb una columna de forma simple (SENSE JOINs, sense WHERE, etc.)
  const res = await fetch("/api/consultDB", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({ table: tableString, camp: campString })
  });
  const json = await res.json();
  return json.result;
};

async function LoadDeleteArtistDropdown() { // Recarregar el dropdown amb el artista eliminat.
  dropdownDeleteArtist.innerHTML = "";
  let result = await ConsultTable("artists", "name");
  result.forEach(artist => {
    let option = document.createElement("option");
    option.value = artist.name;
    option.textContent = artist.name;
    dropdownDeleteArtist.appendChild(option);
  });
};

async function LoadModifyArtistDropdown() {
  dropdownModifyArtist.innerHTML = "";
  let result = await ConsultTable("artists", "name");
  result.forEach(artist => {
    let option = document.createElement("option");
    option.value = artist.name;
    option.textContent = artist.name;
    dropdownModifyArtist.appendChild(option);
  });
};



/*

const dropdownAsix = document.getElementById("Asix1a");

dropdownAsix.addEventListener("focus", async () => {
  let artists = await CridaSelectBackend("artists","name", true, true);
  artists.forEach(artist =>{
    let opcio = document.createElement("option");
    opcio.value = artist.name;
    opcio.textContent = artist.name;
    dropdownAsix.appendChild(opcio);
  })
  //Crido al backend i mostri artistes
});

async function CridaSelectBackend(table, camp, campWhere, valor){
  const res = await fetch ("/api/consultData",{
    method: "POST",
    headers:{
      "Content-type":"application/json"
    },
    body: JSON.stringify({table: table, camp: camp, campWhere: campWhere, valor: valor })
  });
  if(res.status == 200){
    const json = await res.json();
    return json.result;
  } else {
    const errorText = await res.text();
    console.log(errorText);

  }
};

*/
