import type { Request, RequestState } from "../types";
type SavedRequestListProps = {
  requests: Request[];
  requestState: RequestState[];
  currentRequest: number;
  handleTitleChange: (i: number, title: string) => void;
  saveTitle: (i: number) => void;
  handleClick: (i: number, detail: number) => void;
};

const SavedRequestsList = (props: SavedRequestListProps) => {
  const {
    requests,
    requestState,
    currentRequest,
    handleTitleChange,
    saveTitle,
    handleClick,
  } = props;
  return (
    <>
      {requests.map((request, i: number) => {
        const isEdit = requestState[i].isEdit;
        return isEdit ? (
          <input
            className="w-full text-3xl my-2 p-4 font-bold text-left bg-gray-700"
            aria-label="Enter request title"
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
    </>
  );
};

export default SavedRequestsList;
