import { render } from "preact";
import { App } from "./app.tsx";
import DBContextProvider from "./db-context";
import "./index.css";

const Comp = () => (
  <DBContextProvider>
    <App />
  </DBContextProvider>
);

render(<Comp />, document.getElementById("app") as HTMLElement);
