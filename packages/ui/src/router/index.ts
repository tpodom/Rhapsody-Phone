import {
  createWebHistory,
  createRouter,
  RouteRecordNormalized,
} from "vue-router";
import { watch } from "vue";
import CallList from "../components/CallList.vue";
import Login from "../components/Login.vue";
import { useAuthStore } from "../stores/auth";

const routes = [
  {
    path: "/",
    name: "CallList",
    component: CallList,
  },
  {
    path: "/login",
    name: "Login",
    meta: { public: true },
    component: Login,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _, next) => {
  const authStore = useAuthStore();
  function checkAuth() {
    if (
      !to.matched.some((record) => record.meta.public) &&
      !authStore.loggedIn
    ) {
      return next("/login");
    }

    next();
  }

  if (authStore.initialized) {
    checkAuth();
  } else {
    watch(
      () => authStore.initialized,
      (initialized: boolean) => {
        if (initialized) {
          checkAuth();
        }
      }
    );
  }
});

export default router;
