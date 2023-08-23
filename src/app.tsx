import RequestPane from "./request-pane";

export function App() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-black text-gray-400 p-4">
      <header className="p-6 w-full flex items-center gap-2 bg-gray-800 rounded-lg self-center justify-center">
        <img src="/logo.png" height="48" width="48" alt="" />
        <h1 className="font-bold text-4xl text-white">Rest Commander</h1>
      </header>
      <main className="flex flex-col w-full min-h-screen">
        <RequestPane />
      </main>
    </div>
  );
}
