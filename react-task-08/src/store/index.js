import { configureStore } from '@reduxjs/toolkit';
import crewReducer from '../features/crew/crewSlice.js';
import newsReducer from '../features/news/newsSlice.js';
import notificationsReducer from '../features/notifications/notificationsSlice.js';
import requestLogReducer from '../features/requestLog/requestLogSlice.js';

// One store for the whole app, given to React by <Provider> in main.jsx.
// configureStore adds redux-thunk (for createAsyncThunk) and, in development,
// checks that state is never mutated outside reducers and stays serializable.
//
// Not in Redux on purpose:
//   - the signed-in user: AuthContext (Firebase keeps the session itself);
//   - search, filters, sort and page: the URL (useSearchParams);
//   - temporary UI state (open modal, form fields, typed search text): component state.
export const store = configureStore({
    reducer: {
        crew: crewReducer,
        news: newsReducer,
        requestLog: requestLogReducer,
        notifications: notificationsReducer,
    },
});
