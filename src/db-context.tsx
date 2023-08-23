import Dexie from "dexie";
import { createContext, FunctionComponent } from "preact";
import { useContext } from "preact/hooks";

type DBContextType = {
  db: Dexie | null;
};
const DBContext = createContext<DBContextType>({
  db: null,
});
export const useDBContext = () => useContext(DBContext);

const db = new Dexie("rest-db");
db.version(1).stores({
  requests: "id",
});

const DBContextProvider: FunctionComponent<object> = ({ children }) => (
  <DBContext.Provider value={{ db }}>{children}</DBContext.Provider>
);

export default DBContextProvider;
