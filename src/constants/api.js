export const PATHS = {
  API: '/api',
  ROOT: '/',
  BY_ID: '/:id',
};

export const ENDPOINTS = {
  BASE: {
    AUTH: '/auth',
    USERS: '/users',
    PLAYLISTS: '/playlists',
  },
  AUTH: {
    REGISTER: '/register',
    LOGIN: '/login',
    REFRESH_TOKEN: '/refresh-token',
    LOGOUT: '/logout',
  },
  PLAYLIST: {
    SONGS: '/:playlistId/songs',
    SONG_BY_ID: '/:playlistId/songs/:songId',
  },
};


export const VALIDATION_TYPE = {
  BODY: 'body',
  PARAMS: 'params',
  QUERY: 'query',
  HEADERS: 'headers',
};

export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};
