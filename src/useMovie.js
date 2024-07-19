/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
const Key = '44cee0d6';
export function useMovies(query) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("")
    const [movies, setMovies] = useState([]);
    useEffect(function () {
        // callback?.();
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

        fetchMovie()
        return function () {
            controller.abort();
        }
    }, [query])
    return { movies, loading, error }
}