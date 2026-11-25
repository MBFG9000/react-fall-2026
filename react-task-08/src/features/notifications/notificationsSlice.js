import { createSlice, nanoid } from '@reduxjs/toolkit';

// The toast at the bottom of the screen ("X was removed"). It is global on
// purpose: a page shows it right before redirecting to another page, and it
// must still be visible there. RootLayout renders it and hides it after 4 s.
const notificationsSlice = createSlice({
    name: 'notifications',
    initialState: { notice: null }, // { id, tone: 'success' | 'error', text }
    reducers: {
        noticeShown: {
            reducer(state, action) {
                state.notice = action.payload;
            },
            // A new id every time, so the same text twice restarts the timer.
            prepare(tone, text) {
                return { payload: { id: nanoid(), tone, text } };
            },
        },
        noticeDismissed(state) {
            state.notice = null;
        },
    },
});

export const { noticeShown, noticeDismissed } = notificationsSlice.actions;
export default notificationsSlice.reducer;

export const selectNotice = (state) => state.notifications.notice;
