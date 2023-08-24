export type Request = {
  id: string;
  type: string;
  url: string;
  title: string;
};

export type RequestState = {
  isEdit: boolean;
};

export type ResponseType = {
  code: number | null;
  body: string;
  ok: boolean;
  time: number | null;
  headers: string | null;
};
