const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;
console.log(dbPath);
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//API-1
app.get("/movies/", async (request, response) => {
  const getQuery = `
    SELECT 
    * 
    FROM 
    movie;
    `;
  const movieArray = await db.all(getQuery);
  response.send(movieArray);
});

//API-2
app.post("/movies/", async (request, response) => {
  const details = request.body;
  const { directorId, movieName, leadActor } = details;
  const addQuery = `
    INSERT INTO 
        movie (director_id,movie_name,lead_actor)
    VALUES 
        (
            ${directorId},
            '${movieName}',
            '${leadActor}'
        );
    `;
  const newPost = await db.run(addQuery);
  response.send("Movie Successfully Added");
});

//API-3:
const convertDb = (dbObj) => {
  return {
    movieId: dbObj.movie_id,
    directorId: dbObj.director_id,
    movieName: dbObj.movie_name,
    leadActor: dbObj.lead_actor,
  };
};

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getBook = `
    SELECT 
        * 
    FROM 
        movie
    WHERE 
        movie_id = ${movieId};
    `;
  const movieData = await db.get(getBook);
  response.send(convertDb(movieData));
});

//API-4:
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const details = request.body;
  const { directorId, movieName, leadActor } = details;

  const updateDetails = `
    UPDATE 
        movie 
    SET 
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE 
        movie_id = ${movieId}
    `;

  await db.run(updateDetails);
  response.send("Movie Details Updated");
});

//API-5:
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const delQuery = `
    DELETE FROM 
        movie 
    WHERE
        movie_id = ${movieId};
    `;
  await db.run(delQuery);
  response.send("Movie Removed");
});

//API-6:
app.get("/directors/", async (request, response) => {
  const getDirectors = `
    SELECT 
        *
    FROM 
        director;
    `;
  const data = await db.all(getDirectors);
  response.send(data);
});

//API-7:

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const movieList = `
    SELECT 
        *
    FROM 
        movie
    WHERE 
        director_id = ${directorId};
    `;
  const data = await db.all(movieList);

  response.send(data.map((eachMovie) => ({ movieName: eachMovie.movie_name })));
});
