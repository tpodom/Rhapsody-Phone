import { createWebHistory, createRouter, RouteLocationNormalized } from "vue-router";
import { watch } from "vue";
import CallList from "../components/CallList.vue";
import Login from "../components/Login.vue";
import Settings from "../components/Settings.vue";
import GoToAuthCallback from "../components/GoToAuthCallback.vue";
import { useAuthStore } from "../stores/auth";
import { useSnackbarStore } from "../stores/snackbar";

const routes = [
  {
    path: "/",
    name: "CallList",
    component: CallList,
  },
  {
    path: "/goto/callback",
    name: "GoToAuthCallback",
    component: GoToAuthCallback,
    props: (route: RouteLocationNormalized) => ({
      code: route.query.code,
      state: route.query.state,
    }),
    meta: { admin: true },
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
    meta: { admin: true },
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
  const snackbar = useSnackbarStore();

  function checkAuth() {
    if (to.matched.some((record) => record.meta.admin) && !authStore.isAdmin) {
      snackbar.showError("Not authorized.");
      return next("/");
    }
    if (!to.matched.some((record) => record.meta.public) && !authStore.loggedIn) {
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
      },
    );
  }
});

export default router;
