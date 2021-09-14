import Home from "./page/home";
import Post from "./page/list";

// import fetchData from "./helpers/fetchData";

export default [
  {
    path: "/",
    exact: true,
    component: Home,
  },
  {
    path: "/post",
    exact: true,
    component: Post,
  },
];
