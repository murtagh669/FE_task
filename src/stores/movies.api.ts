import { RequestConstructor } from "@composables/helpers/types";
import axios from "axios";
const PATH_MOVIE_DB = "https://api.themoviedb.org/3/";
const apiKey = import.meta.env.VITE_DBMOVIE_API_KEY;

export const GET_MOVIES_GENRES: RequestConstructor<{
    query: { with_genres: string | null; page: number; api_key?: string };
  }>
   = {
  api: axios,
  method: "GET",
  path: `${PATH_MOVIE_DB}discover/movie`,
  query: {
    api_key: {
      default: apiKey,
    },
    page: {},
    with_genres: {},
  },
};

export const GET_MOVIES_POPULAR: RequestConstructor<{}> = {
  api: axios,
  method: "GET",
  path: `${PATH_MOVIE_DB}movie/popular`,
  query: {
    api_key: {
      required: true,
      default: apiKey,
    },
  },
}
