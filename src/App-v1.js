/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import StarRating from "./starRating";



const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const Key = '44cee0d6';

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("")
  const [selectedId, setSelectedId] = useState(null)

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null)
  }

  function handleAddWatch(movie) {
    setWatched((watched) => [...watched, movie])
  }


  function handleDeleteWatch(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }



  useEffect(function () {
    const controller = new AbortController()
    async function fetchMovie() {
      try {
        setLoading(true)
        setError('')
        const Data = await fetch(`https://www.omdbapi.com/?apikey=${Key}&s=${query}`
          , { signal: controller.signal });
        if (!Data.ok) throw new Error("Something went wrong with fetching movie")
        const json = await Data.json();
        if (json.Response === 'False') throw new Error('Movie not found')
        setMovies(json.Search);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.log(err.message)
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }
    if (query.length < 3) {

      setMovies([])
      setError("")
      return
    }
    handleCloseMovie()
    fetchMovie()
    return function () {
      controller.abort();
    }
  }, [query])


  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResult movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {loading ? (
            <Loader />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}

          {/* {loading && <Loader />}
          {loading && !error && <MovieList movies={movies} />}
          {error && <ErrorMessage message={error} />} */}
          {/* {loading ? <Loader /> :
            <MovieList movies={movies} />} */}
        </Box>
        <Box>
          {selectedId ? <MovieDetails
            selectedId={selectedId}
            onCloseMovie={handleCloseMovie}
            onAddWatch={handleAddWatch}
            watched={watched}
          /> :
            <>
              <WatchSummary watched={watched} />
              <WatchedMovieList watched={watched}
                onDeleteWatched={handleDeleteWatch}
              />
            </>
          }

        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>
}

function ErrorMessage({ message }) {
  return <p className="error"><span>⚠</span>{message}</p>
}
function NavBar({ children }) {
  return (
    < nav className="nav-bar" >
      <Logo />
      {children}
    </nav >)
}

function Logo() {
  return (<div div className="logo" >
    <span role="img">🍿</span>
    <h1>usePopcorn</h1>
  </div >);

}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)} />
  );
}

function NumResult({ movies }) {
  return <p className="num-results">Found <strong>{movies.length}</strong> Results</p>
}

function Main({ children }) {
  return (
    <main className="main">
      {children}
    </main>);
}


function Box({ children }) {

  const [isOpen, setIsOpen] = useState(true);
  return (<div className="box">
    <button
      className="btn-toggle"
      onClick={() => setIsOpen((open) => !open)}
    >
      {isOpen ? "–" : "+"}
    </button>
    {isOpen && (
      children
    )}
  </div>);
}


// function WatchedBox() {
//   
//   const [isOpen, setIsOpen] = useState(true);
//   return <div className="box">
//     <button
//       className="btn-toggle"
//       onClick={() => setIsOpen((open) => !open)}
//     >
//       {isOpen ? "–" : "+"}
//     </button>
//     {isOpen && (

//     )}
//   </div>
// }
function MovieList({ movies, onSelectMovie }) {

  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}
function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );


}

function MovieDetails({ selectedId, onCloseMovie, onAddWatch, watched }) {
  const [movie, setMovie] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [userRating, SetUserRating] = useState('')

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId)
  const watchedRating = watched.find((movie) => movie.imdbID === selectedId)?.userRating
  const {
    Title: title,
    Year: year,
    imdbRating,
    Runtime: runtime,
    Plot: plot,
    Poster: poster,
    Actors: actors,
    Director: director,
    Genre: genre,
    Released: released,
  } = movie;



  function addHandle() {
    const newWatchMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };
    onAddWatch(newWatchMovie);
    onCloseMovie();
  }
  useEffect(function () {
    function callback(e) {
      if (e.code === 'Escape') {
        onCloseMovie()
      }
    }
    document.addEventListener('keydown', callback)
    return function () {
      document.removeEventListener('keydown', callback)
    }
  }, [onCloseMovie])
  useEffect(function () {
    async function getMovieDetails() {
      setIsLoading(true)
      const Data = await fetch(`https://www.omdbapi.com/?apikey=${Key}&i=${selectedId}`);
      const json = await Data.json();
      setMovie(json)
      setIsLoading(false)
    }
    getMovieDetails()

  }, [selectedId])

  useEffect(function () {
    if (!title) return;
    document.title = `Movie | ${title}`
    return function () {
      document.title = "usePopcorn"
    }

  }, [title])



  return (
    <div className="details">
      {isLoading ? <Loader /> :
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ?
                <>
                  <StarRating maxRating={10} size={24} onSetRating={SetUserRating} />
                  {userRating > 0 && (<button button className="btn-add"
                    onClick={addHandle}>+ Add to list</button>)}
                </>
                : <p>You have already rated this movie    {watchedRating}<span>⭐</span></p>
              }
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      }
    </div >
  );
}


function WatchSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return <div className="summary">
    <h2>Movies you watched</h2>
    <div>
      <p>
        <span>#️⃣</span>
        <span>{watched.length} movies</span>
      </p>
      <p>
        <span>⭐️</span>
        <span>{avgImdbRating.toFixed(2)}</span>
      </p>
      <p>
        <span>🌟</span>
        <span>{avgUserRating.toFixed(2)}</span>
      </p>
      <p>
        <span>⏳</span>
        <span>{avgRuntime.toFixed(2)} min</span>
      </p>
    </div>
  </div>
}

function WatchedMovieList({ watched, onDeleteWatched }) {
  return (<ul className="list">
    {watched.map((movie) => (
      <WatchedMovie movie={movie} key={movie.imdbID}
        onDeleteWatched={onDeleteWatched}
      />
    ))}
  </ul>);
}
function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>X</button>
      </div>
    </li>
  );
}