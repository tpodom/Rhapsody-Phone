import { createWebHistory, createRouter, RouteLocationNormalized } from "vue-router";
import { watch } from "vue";
import Login from "../views/Login.vue";
import Settings from "../views/Settings.vue";
import GoToAuthCallback from "../views/GoToAuthCallback.vue";
import { useAuthStore } from "../stores/auth";
import { useSnackbarStore } from "../stores/snackbar";
import CallList from "../views/CallList.vue";
import Messages from "../views/Messages.vue";
import MessagesNavContent from "../components/messages/MessagesNavContent.vue";
import NoConversationSelected from "../components/messages/NoConversationSelected.vue";
import Conversation from "../components/messages/Conversation.vue";

const routes = [
  {
    path: "/",
    name: "index",
    redirect: "/calls",
  },
  {
    path: "/calls",
    name: "Calls",
    component: CallList,
  },
  {
    path: "/messages",
    name: "Messages",
    components: {
      default: Messages,
      "nav-content": MessagesNavContent,
    },
    children: [
      {
        path: "",
        component: NoConversationSelected,
      },
      {
        path: ":id",
        component: Conversation,
        props: (route: RouteLocationNormalized) => ({ id: route.params.id }),
      },
    ],
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
