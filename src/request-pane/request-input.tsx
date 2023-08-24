import type { Request } from "../types";
type RequestInputProps = {
  current: Request;
  setRequestUrl: (s: string) => void;
  setRequestType: (s: string) => void;
  makeRequest: () => void;
};

const RequestInput = (props: RequestInputProps) => {
  const { current, setRequestType, setRequestUrl, makeRequest } = props;
  return (
    <div className="flex flex-row gap-2">
      <select
        aria-label="Select request type"
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
        aria-label="enter request url"
        placeholder="Enter request url"
        className="text-xl bg-gray-700 p-2 w-8/12 font-bold text-white rounded-lg"
        value={current.url}
        onChange={(ev) =>
          setRequestUrl((ev?.target as HTMLInputElement)?.value)
        }
      />
      <button
        onClick={makeRequest}
        className="text-xl font-bold text-white rounded-lg text-center w-2/12 bg-blue-700"
      >
        Send
      </button>
    </div>
  );
};

export default RequestInput;
