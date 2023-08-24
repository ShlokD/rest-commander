import { useState, useEffect } from "preact/hooks";
import { useDBContext } from "../db-context";
import { ulid } from "ulid";
import RequestInput from "./request-input";
import SavedRequestsList from "./saved-requests-list";
import type { ResponseType, Request, RequestState } from "../types";

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
    headers: null,
  });
  const [requestText, setRequestText] = useState("{}");
  const [headersText, setHeadersText] = useState("{}");
  const [showHeaders, setShowHeaders] = useState(false);

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
          code: 400,
          body: "Bad Request",
          ok: false,
          time: null,
          headers: null,
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

      if (headersText) {
        try {
          const requestHeaders = JSON.parse(headersText);
          options.headers = {
            ...options.headers,
            ...requestHeaders,
          };
        }
        catch (e) {}
      }

      const res = await fetch(url, options);
      const json = await res.json();
      const headers = Object.fromEntries(res.headers.entries());

      setResponse({
        code: res.status,
        body: JSON.stringify(json, undefined, 2),
        ok: res.ok,
        time: Date.now() - time,
        headers: JSON.stringify(headers, undefined, 2),
      });
    }
    catch (e) {
      const err: any = e;
      setResponse({
        code: err.code || 500,
        body: err.message || "Unknown Error",
        ok: false,
        time: Date.now() - time,
        headers: null,
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

        <SavedRequestsList
          requests={requests}
          requestState={requestState}
          currentRequest={currentRequest}
          handleClick={handleClick}
          saveTitle={saveTitle}
          handleTitleChange={handleTitleChange}
        />
      </div>
      <div
        className="lg:w-4/5 w-full bg-gray-800 rounded-lg p-2"
        style={{ minHeight: "90vh" }}
      >
        {current && (
          <div className="flex flex-col gap-2">
            <RequestInput
              current={current}
              makeRequest={makeRequest}
              setRequestUrl={setRequestUrl}
              setRequestType={setRequestType}
            />
            <div className="flex flex-row gap-2 items-stretch">
              <div
                className="flex flex-col w-1/2 h-full gap-2"
                style={{ minHeight: "80vh" }}
              >
                <p className="p-2 text-2xl font-bold">{`Request ${
                  showHeaders ? "Headers" : "Body"
                }`}</p>
                <div className="py-8 w-full">
                  <label
                    htmlFor="toggle-headers"
                    className={`${
                      showHeaders ? "bg-green-400" : "bg-black"
                    } border-2 border-black rounded-lg font-bold text-white p-2`}
                  >
                    Show Headers
                  </label>
                  <input
                    id="toggle-headers"
                    type="checkbox"
                    className="hidden"
                    defaultChecked={showHeaders}
                    onChange={() => setShowHeaders((prev) => !prev)}
                  />
                </div>
                {showHeaders ? (
                  <textarea
                    style={{ minHeight: "80vh" }}
                    aria-label="Enter headers"
                    className="text-2xl text-white bg-gray-700 border-2 p-2"
                    value={headersText}
                    onChange={(ev) =>
                      setHeadersText((ev?.target as HTMLTextAreaElement)?.value)
                    }
                  />
                ) : (
                  <textarea
                    style={{ minHeight: "80vh" }}
                    aria-label="Enter request body"
                    className="text-2xl text-white bg-gray-700 border-2 p-2"
                    value={requestText}
                    onChange={(ev) =>
                      setRequestText((ev?.target as HTMLTextAreaElement)?.value)
                    }
                    disabled={
                      current?.type !== "POST" && current.type !== "PUT"
                    }
                  />
                )}
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
                          response.ok ? "bg-green-700" : "bg-red-500"
                        }`}
                      >
                        {response.code}
                      </div>
                      <div
                        className={
                          "p-4 text-white text-lg font-bold bg-gray-900"
                        }
                      >
                        {response.time}ms
                      </div>
                    </div>
                    {response.headers && (
                      <details className="p-2 text-white">
                        <summary>Headers</summary>
                        {response.headers}
                      </details>
                    )}
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
