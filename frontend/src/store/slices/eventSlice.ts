import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Event {
  id: string;
  name: string;
  description?: string;
  subheading?: string;
  timezone: string;
  startDateTime?: string;
  endDateTime?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
  bannerImageUrl?: string;
  vanishDate?: string;
  roles?: string[];
}

interface EventState {
  events: Event[];
  currentEvent: Event | null;
  loading: boolean;
}

const initialState: EventState = {
  events: [],
  currentEvent: null,
  loading: false,
};

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload;
    },
    setCurrentEvent: (state, action: PayloadAction<Event | null>) => {
      state.currentEvent = action.payload;
    },
    updateCurrentEvent: (state, action: PayloadAction<Partial<Event>>) => {
      if (state.currentEvent) {
        state.currentEvent = { ...state.currentEvent, ...action.payload };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setEvents, setCurrentEvent, updateCurrentEvent, setLoading } = eventSlice.actions;
export default eventSlice.reducer;
