<script setup lang="ts">
import { onMounted, ref, toRefs } from "vue";
import { useRoute, useRouter } from "vue-router";
import { CategoriesTabs, MovieCard } from "@/app.organizer";
import { TCategoryItem } from "@/types/movies";
import { ROUTE_DASHBOARD_MOVIES_LIST } from "@/app.routes";
import { useMoviesStore } from "@/stores/movies";
import categories from "@/constants/categories";

const router = useRouter();
const route = useRoute();

const moviesStore = useMoviesStore();

const { currentPage, moviesGenres, end } = toRefs(moviesStore.state);

const currentTab = ref<TCategoryItem>(categories[0]);
const isLoadingNextPage = ref(false);

const getGenres = (genre: number[], page: number = 1) =>
  moviesStore.getGenres(genre, page);

const getCategoryByName = (name: string): TCategoryItem | undefined =>
  categories.find((e: any) => e.name === name);

const onChangeTab = (tab: TCategoryItem): void => {
  router.push({
    name: ROUTE_DASHBOARD_MOVIES_LIST.name,
    query: { genre: tab.name },
  });
  currentTab.value = tab;
  getGenres(tab.value, 1);
};

const handleScroll = async (event: UIEvent) => {
  const target = event.target as HTMLDivElement;

  if (
    target.scrollTop + target.clientHeight >=
    target.scrollHeight - 400 * currentPage.value
  ) {
    if (!end.value && !isLoadingNextPage.value) {
      isLoadingNextPage.value = true;
      const category = currentTab.value;
      await getGenres(category.value, currentPage.value + 1);
      isLoadingNextPage.value = false;
    }
  }
};

const syncCurrentTab = () => {
  const queryGenre = route.query.genre || null;

  const queryCategory = queryGenre
    ? getCategoryByName(queryGenre as string)
    : null;

  currentTab.value = queryCategory || categories[0];
};

onMounted(() => {
  syncCurrentTab();

  const category = currentTab.value;

  getGenres(category.value, currentPage.value);
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
