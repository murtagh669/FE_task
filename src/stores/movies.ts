import { reactive } from "vue";
import useApi from '@composables/useApi';
import { TMovieData } from "@/types/movies";
import { LOCALSTORAGE_MOVIES_FAVORITES } from "@/app.storages";

import { GET_MOVIES_GENRES, GET_MOVIES_POPULAR } from './movies.api'

const state = reactive({
    favorites: localStorage.getItem(LOCALSTORAGE_MOVIES_FAVORITES)
        ? (JSON.parse(
            localStorage.getItem(LOCALSTORAGE_MOVIES_FAVORITES) as string
        ) as TMovieData[])
        : ([] as TMovieData[]),
    moviesTrends: [],
    moviesGenres: [],
    error: '',
    loading: false,
    currentPage: 1,
    end: false,
})

export const useMoviesStore = () => {
    /**
     * Get Movies genres
     */
    const getGenres = async (genre: number[], page: number = 1) => {

        try {
           state.loading = true;

            const response = await useApi(GET_MOVIES_GENRES, {
                query: {
                    with_genres: !genre.includes(0) ? genre.join("|") : null,
                    page: page,
                }
            })

            if (response.isSuccess) {
                if (page <= state.currentPage) state.moviesGenres = response.data.results;
                else state.moviesGenres = state.moviesGenres.concat(response.data.results);
                if (response.data.total_pages === page) state.end = true;
                else state.end = false;

                state.currentPage = page;
            }

            state.loading = false;
        } catch (e) {
            console.error(e);
        }
    };

    /**
     * Get movies trends
     */
    const getTrends = async() => {
        try {
            state.loading = true;

            const response = await useApi(GET_MOVIES_POPULAR);

            if (response.isSuccess) {
                state.moviesTrends = response.data.results.slice(0, 4);
            }
            state.loading = false;
        }
        catch(e) {
            console.error(e);
        }
    };
    
    /**
        * Add to favorites
    */
    const addFavorite = (movie: TMovieData) => {
        state.favorites.push(movie);

        localStorage.setItem(
            LOCALSTORAGE_MOVIES_FAVORITES,
            JSON.stringify(state.favorites)
        );
    };

    /**
     * Remove from favorites
     */
    const removeFavorite = async (movie: TMovieData) => {
        state.favorites = state.favorites.filter(
            (e: TMovieData) => e.id !== movie.id
        );

        localStorage.setItem(
            LOCALSTORAGE_MOVIES_FAVORITES,
            JSON.stringify(state.favorites)
        );
    };

    return {
        state,
        getGenres,
        getTrends,
        addFavorite,
        removeFavorite
    }
}
