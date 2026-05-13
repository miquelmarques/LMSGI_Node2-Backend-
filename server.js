const express = require("express");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "artists.db");

fs.mkdirSync(dataDir, { recursive: true });

const db = new sqlite3.Database(dbPath);

// Creem la taula i ens assegurem que hi hagi dades inicials.
db.serialize(() => {
  //db.run("DELETE FROM album");
  //db.run("DELETE FROM album_artist");
 // db.run("DELETE FROM song");
  db.run(`
    CREATE TABLE IF NOT EXISTS artists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS album (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )`
  );
  db.run(`
    CREATE TABLE IF NOT EXISTS song(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_album INTEGER REFERENCES album(id),
      name TEXT NOT NULL
  )`
  );
  db.run(`CREATE TABLE IF NOT EXISTS album_artist(
     id_album INTEGER,
     id_artists INTEGER,
     PRIMARY KEY(id_album,id_artists),
     FOREIGN KEY (id_album) REFERENCES album(id),
     FOREIGN KEY (id_artists) REFERENCES artists(id)
    )`);

  db.get("SELECT id FROM artists WHERE name = ?", ["Txarango"], (error, row) => {
    if (error) {
      console.log("Error comprovant dades inicials:", error.message);
      return;
    }

    if (!row) {
      db.run("INSERT INTO artists (name) VALUES (?)", ["Txarango"]);
    }
  });

  db.get("SELECT id FROM artists WHERE name = ?", ["Oques Grasses"], (error, row) => {
    if (error) {
      console.log("Error comprovant dades inicials:", error.message);
      return;
    }

    if (!row) {
      db.run("INSERT INTO artists (name) VALUES (?)", ["Oques Grasses"]);
    }
  });
  //INSERIR SOM RIU TXARANGO
  db.get("SELECT id FROM album WHERE name = ?", ["Som riu"], (error, row) => {
    if (error) {
      console.log("Error comprovant dades inicials:", error.message);
      return;
    }

    if (!row) {
      db.serialize(() => {
        db.run("INSERT INTO album (name) VALUES (?)", ["Som riu"]);
        db.run("INSERT INTO album_artist (id_album, id_artists) VALUES ((SELECT id FROM album WHERE name = ?),(SELECT id FROM artists WHERE name = ?))", ["Som riu", "Txarango"]);
      });
    }
  });
  //INSERIR FANS DEL SOL OQUES GRASSES
  db.get("SELECT id FROM album WHERE name = ?", ["Fans del Sol"], (error, row) => {
    if (error) {
      console.log("Error comprovant dades inicials:", error.message);
      return;
    }

    if (!row) {
      db.serialize(() => {
        db.run("INSERT INTO album (name) VALUES (?)", ["Fans del Sol"]);
        db.run("INSERT INTO album_artist (id_album, id_artists) VALUES ((SELECT id FROM album WHERE name = ?),(SELECT id FROM artists WHERE name = ?))", ["Fans del Sol", "Oques Grasses"]);
      });
    }
  });
  // Inserir canço 1 del album Som riu
  db.get("SELECT id FROM song WHERE name = ?", ["Músic de carrer"], (error, row) => {
    if (error) {
      console.log("Error comprovant dades inicials:", error.message);
      return;
    }

    if (!row) {
      db.run("INSERT INTO song (name, id_album) VALUES (?,(SELECT id FROM album WHERE name = ?))", ["Músic de carrer", "Som riu"]);
    }
  });

  //Inserir canço 2 del album Som riu
  db.get("SELECT id FROM song WHERE name = ?", ["Som un riu"], (error, row) => {
    if (error) {
      console.log("Error comprovant dades inicials:", error.message);
      return;
    }

    if (!row) {
      db.run("INSERT INTO song (name, id_album) VALUES (?,(SELECT id FROM album WHERE name = ?))", ["Som un riu", "Som riu"]);
    }
  });
  // Inserir canço 1 del album Fans del Sol
  db.get("SELECT id FROM song WHERE name = ?", ["In the Night"], (error, row) => {
    if (error) {
      console.log("Error comprovant dades inicials:", error.message);
      return;
    }

    if (!row) {
      db.run(
        "INSERT INTO song (name, id_album) VALUES (?,(SELECT id FROM album WHERE name = ?))",
        ["In the Night", "Fans del Sol"]
      );
    }
  });

  // Inserir canço 2 del album Fans del Sol
  db.get("SELECT id FROM song WHERE name = ?", ["Sta Guai"], (error, row) => {
    if (error) {
      console.log("Error comprovant dades inicials:", error.message);
      return;
    }

    if (!row) {
      db.run(
        "INSERT INTO song (name, id_album) VALUES (?,(SELECT id FROM album WHERE name = ?))",
        ["Sta Guai", "Fans del Sol"]
      );
    }
  });
});



app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


app.post("/api/AddArtist", (req, res) => {
  const name = req.body.data;
  db.run("INSERT INTO artists (name) VALUES (?)", [name], (error) => {
    if (error) {
      res.status(500).type("text").send(`Error: ${error.message}`);
      return;
    }
    res.status(201).type("text").send(`Artista desat: ${name}`);
  });
});

app.post("/api/artists", (req, res) => {
  const table = req.body.data;
  db.all(`SELECT * FROM ${table} ORDER BY id DESC`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    console.log(rows);
    res.json({ result: rows });
  });
});

app.post("/api/consultDB", (req, res) => {
  let table = req.body.table;
  let camp = req.body.camp;
  db.all(`SELECT ${camp} FROM ${table}`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    };
    console.log(rows);
    res.json({ result: rows });
  });
});

app.post("/api/RemoveArtist", (req, res) => { //Eliminar un artista requereix esborrar tots el altres valors.
  const name = req.body.data;
  db.serialize(() => {
    db.run(
      `DELETE FROM song
       WHERE id_album IN (
         SELECT album.id
         FROM album
         JOIN album_artist ON album.id = album_artist.id_album
         JOIN artists ON artists.id = album_artist.id_artists
         WHERE artists.name = ?
       )`,
      [name]
    ); // Eliminem totes les cançons del artista.
    db.run(
      `DELETE FROM album
       WHERE id IN (
         SELECT album.id
         FROM album
         JOIN album_artist ON album.id = album_artist.id_album
         JOIN artists ON artists.id = album_artist.id_artists
         WHERE artists.name = ?
       )`,
      [name]
    );// Eliminem totes els albums del artista.
    db.run(
      `DELETE FROM album_artist
       WHERE id_artists IN (
         SELECT id
         FROM artists
         WHERE name = ?
       )`,
      [name]
    );// eliminem la relacio album amb artista.
    db.run("DELETE FROM artists WHERE name = ?", [name], (error) => { // finalment borrem el artista.
      if (error) {
        res.status(500).type("text").send(`Error: ${error.message}`);
        return;
      }
      res.status(201).type("text").send(`Artista Eliminat: ${name}`);
    });
  })


});

app.post("/api/album", (req, res) => {// Funcio per retornar un json amb la canço, del album x del artista y
  const table = req.body.data;
  db.all(`SELECT
      album.name AS album,
      artists.name AS artists
    FROM ${table}
    LEFT JOIN album_artist ON album.id = album_artist.id_album
    LEFT JOIN artists ON artists.id = album_artist.id_artists
    GROUP BY album.id
    ORDER BY album.id DESC `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    console.log(rows);
    res.json({ result: rows });
  });
});
app.post("/api/song", (req, res) => { // Funcio per retornar un json amb la canço, de tots els albums i dels artistes
  const table = req.body.data;
  db.all(`SELECT
      song.name AS song,
      album.name AS album,
      artists.name AS artists
    FROM ${table}
    INNER JOIN album ON song.id_album = album.id
    LEFT JOIN album_artist ON album.id = album_artist.id_album
    LEFT JOIN artists ON artists.id = album_artist.id_artists
    GROUP BY song.id
    ORDER BY song.id DESC `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    console.log(rows);
    res.json({ result: rows });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor a http://localhost:${PORT}`);
  console.log(`Base de dades SQLite: ${dbPath}`);
});
/*
app.post("/api/consultData", (req,res)=>{
  const tableName = req.body.table;
  const camp = req.body.camp;
  const whereCamp = req.body.campWhere;
  const valor = req.body.valor;

  let sql = `SELECT ${camp} FROM  ${tableName} WHERE ${whereCamp} = ?`;

  db.all(sql,[valor], (error, rows)=>{
    if (error){
      console.log(error);
      res.status(500).type("text").send(`Error: ${error.message}`);
      return;
    } 
    res.json({result: rows});
  })
})*/