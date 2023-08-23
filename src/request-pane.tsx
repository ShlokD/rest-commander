import { useState, useEffect } from "preact/hooks";
import { useDBContext } from "./db-context";
import { ulid } from "ulid";

type Request = {
  id: string;
  type: string;
  url: string;
  title: string;
};

type RequestState = {
  isEdit: boolean;
};

type ResponseType = {
  code: number | null;
  body: string;
  ok: boolean;
  time: number | null;
};
const RequestPane = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [requestState, setRequestState] = useState<RequestState[]>(
    new Array(requests.length).fill({ isEdit: false })
  );
  const [currentRequest, setCurrentRequest] = useState(-1);
  const [response, setResponse] = useState<ResponseType>({
    code: null,
    body: "",
    ok: false,
    time: null,
  });
  const [requestText, setRequestText] = useState("{}");
  const { db } = useDBContext();

  const loadRequestsFromDB = async () => {
    if (!db) {
      return;
    }
    try {
      const rawRequests = await db.table("requests").toArray();
      setRequests(rawRequests);
      setRequestState(new Array(rawRequests.length).fill({ isEdit: false }));
      setCurrentRequest(0);
    }
    catch (e) {
      setRequests(requests);
    }
  };

  const addNewRequest = async () => {
    const newRequest = {
      id: ulid(),
      title: "New Request",
      type: "GET",
      url: "",
    };

    setRequests((prev) => {
      const newRequests = [...prev, newRequest];
      setCurrentRequest(newRequests.length - 1);
      return newRequests;
    });
    setRequestState((prev) => [...prev, { isEdit: false }]);
    if (db) {
      await db.table("requests").put(newRequest);
    }
  };

  const handleClick = (index: number, detail: number) => {
    switch (detail) {
    case 1: {
      setCurrentRequest(index);
      break;
    }
    case 2: {
      setRequestState((prev) => {
        const newState = prev.slice();
        newState[index] = { ...newState[index], isEdit: true };
        return newState;
      });
      break;
    }
    default: {
      break;
    }
    }
  };

  const saveTitle = async (index: number) => {
    const request = requests[index];
    if (db) {
      await db.table("requests").put(request);
    }
    setRequestState((prev) => {
      const newState = prev.slice();
      newState[index] = { ...newState[index], isEdit: false };
      return newState;
    });
  };

  const handleTitleChange = (index: number, text: string) => {
    setRequests((prev) => {
      const newRequests = prev.slice();
      newRequests[index] = {
        ...newRequests[index],
        title: text,
      };
      return newRequests;
    });
  };

  const setRequestType = async (value: string) => {
    const request = requests[currentRequest];
    setRequests((prev) => {
      const newRequests = prev.slice();
      newRequests[currentRequest] = {
        ...newRequests[currentRequest],
        type: value,
      };
      return newRequests;
    });
    if (db) {
      await db.table("requests").put({ ...request, type: value });
    }
  };

  const setRequestUrl = async (value: string) => {
    const request = requests[currentRequest];
    setRequests((prev) => {
      const newRequests = prev.slice();
      newRequests[currentRequest] = {
        ...newRequests[currentRequest],
        url: value,
      };
      return newRequests;
    });
    if (db) {
      await db.table("requests").put({ ...request, url: value });
    }
  };

  const makeRequest = async () => {
    const method = requests[currentRequest].type;
    const isPost = method === "POST" || method === "PUT";
    if (isPost) {
      try {
        JSON.parse(requestText);
      }
      catch (e) {
        setResponse({
          code: 403,
          body: "Invalid body",
          ok: false,
          time: null,
        });
        return;
      }
    }
    const time = Date.now();

    try {
      const url = requests[currentRequest].url;

      const options: RequestInit = {
        method,
      };
      if (isPost) {
        options.body = requestText;
        options.headers = {
          "content-type": "application/json",
        };
      }

      const res = await fetch(url, options);
      const json = await res.json();
      setResponse({
        code: res.status,
        body: JSON.stringify(json, undefined, 2),
        ok: res.ok,
        time: Date.now() - time,
      });
    }
    catch (e) {
      const err: any = e;
      setResponse({
        code: err.code || 500,
        body: err.message || "Unknown Error",
        ok: false,
        time: Date.now() - time,
      });
    }
  };
  useEffect(() => {
    if (db) {
      loadRequestsFromDB();
    }
  }, [db]);

  const current = requests[currentRequest];
  return (
    <div className="flex lg:flex-row flex-col gap-2 my-2">
      <div
        className="lg:w-1/5 w-full bg-gray-800 rounded-lg flex flex-col"
        style={{ minHeight: "90vh" }}
      >
        <button
          onClick={addNewRequest}
          className="p-4 my-2 rounded-xl text-2xl bg-blue-700 text-bold text-white w-11/12 self-center font-bold"
        >
          New
        </button>

        {requests.map((request, i) => {
          const isEdit = requestState[i].isEdit;
          return isEdit ? (
            <input
              className="w-full text-3xl my-2 p-4 font-bold text-left bg-gray-700"
              value={request.title}
              onChange={(ev) =>
                handleTitleChange(i, (ev.target as HTMLInputElement)?.value)
              }
              onBlur={() => saveTitle(i)}
            />
          ) : (
            <button
              key={`request-option-${i}`}
              className={`w-full text-3xl my-2 p-4 font-bold text-left touch-events-all ${
                i === currentRequest ? "text-gray-100" : ""
              }`}
              onClick={(ev) => {
                handleClick(i, ev.detail);
              }}
              title="Double Click to Edit"
            >
              {request.title}
            </button>
          );
        })}
      </div>
      <div
        className="lg:w-4/5 w-full bg-gray-800 rounded-lg p-2"
        style={{ minHeight: "90vh" }}
      >
        {current && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <select
                className="text-3xl bg-gray-700 p-2 w-2/12 font-bold text-white rounded-lg"
                value={current.type}
                onChange={(ev) =>
                  setRequestType((ev.target as HTMLSelectElement)?.value)
                }
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
              <input
                className="text-xl bg-gray-700 p-2 w-8/12 font-bold text-white rounded-lg"
                value={current.url}
                onChange={(ev) =>
                  setRequestUrl((ev?.target as HTMLInputElement)?.value)
                }
              />
              <button
                onClick={makeRequest}
                className="text-xl font-bold text-white rounded-lg text-center w-2/12 bg-blue-400"
              >
                Send
              </button>
            </div>
            <div className="flex flex-row gap-2 items-stretch">
              <div
                className="flex flex-col w-1/2 h-full gap-2"
                style={{ minHeight: "80vh" }}
              >
                <p className="p-2 text-2xl font-bold">Request Body</p>
                <div className="py-8 w-full" />
                <textarea
                  style={{ minHeight: "80vh" }}
                  className="text-2xl text-white bg-gray-700 border-2 p-2"
                  value={requestText}
                  onChange={(ev) =>
                    setRequestText((ev?.target as HTMLTextAreaElement)?.value)
                  }
                  disabled={current?.type !== "POST" && current.type !== "PUT"}
                />
              </div>
              <div
                className="flex flex-col w-1/2 h-full gap-2 "
                style={{ minHeight: "80vh" }}
              >
                <p className="p-2 text-2xl font-bold">Response</p>
                {response.code !== null && (
                  <>
                    <div className="flex flex-row gap-2">
                      <div
                        className={`p-4 text-white text-lg font-bold ${
                          response.ok ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {response.code}
                      </div>
                      <div
                        className={
                          "p-4 text-white text-lg font-bold bg-gray-400"
                        }
                      >
                        {response.time}ms
                      </div>
                    </div>
                    <div
                      className="bg-gray-700 text-white my-2 overflow-scroll"
                      style={{ minHeight: "80vh" }}
                    >
                      <pre className="text-sm" wrap="2">
                        {response.body}
                      </pre>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestPane;
