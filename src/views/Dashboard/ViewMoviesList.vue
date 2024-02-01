<script setup lang="ts">
import { onMounted, ref, toRefs } from "vue";
import { CategoriesTabs, MovieCard } from "@/app.organizer";
import { TCategoryItem } from "@/types/movies";
import { ROUTE_DASHBOARD_MOVIES_LIST } from "@/app.routes";
import { useMoviesStore } from "@/stores/movies";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

const moviesStore = useMoviesStore();

const { currentPage, moviesGenres, end } = toRefs(moviesStore.state);

const currentTab = ref<TCategoryItem | null>(null);
const isLoadingNextPage = ref(false);

const categories = [
  {
    name: "All",
    value: [28, 16, 12, 35, 99],
  },
  {
    name: "Action",
    value: [28],
  },
  {
    name: "Animation",
    value: [16],
  },
  {
    name: "Adventure",
    value: [12],
  },
  {
    name: "Comedy",
    value: [35],
  },
  {
    name: "Documentary",
    value: [99],
  },
];

const getGenres = async (genre: number[], page: number = 1) => {
  isLoadingNextPage.value = true;
  await moviesStore.getGenres(genre, page);
  isLoadingNextPage.value = false;
};

const getCategory = (name: string): TCategoryItem | undefined =>
  categories.find((e: any) => e.name === name);

const onChangeTab = (tab: TCategoryItem): void => {
  router.push({
    name: ROUTE_DASHBOARD_MOVIES_LIST.name,
    query: { genre: tab.name },
  });
  currentTab.value = tab;
  getGenres(tab.value, 1);
};

const handleScroll = async (event: any) => {
  const { target } = event;
  if (
    target.scrollTop + target.clientHeight >=
    target.scrollHeight - 400 * currentPage.value
  ) {
    if (!end.value &&!isLoadingNextPage.value) {
      const category = currentTab.value || null;
      if (category) await getGenres(category.value, currentPage.value + 1);
    }
  }
};

onMounted(async () => {
  const queryGenre = route.query.genre || null;

  if (queryGenre) {
    let categoryQuery = getCategory(queryGenre as string);
    if (categoryQuery) currentTab.value = categoryQuery;
  } else {
    currentTab.value = categories[0];
  }

  const category = currentTab.value;
  if (category) {
    await getGenres(category.value, currentPage.value);
  }
});
</script>

<template>
  <div class="db-movies-list flex-1 flex flex-col p-1 pt-16">
    <CategoriesTabs
      :items="categories"
      @onChange="onChangeTab"
      :value="currentTab"
      class="a-04 fadeInDown"
    />
    <div
      class="a-07 fadeInUp h-10 overflow-y-scroll flex-auto"
      @scroll="handleScroll"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <MovieCard
          v-for="(movie, index) in moviesGenres"
          :key="'m-' + index"
          :data="movie"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss"></style>
