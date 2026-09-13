# Frontend architecture

The frontend is organized around route-level features, focused UI components, and hooks that own server state.

## Loading strategy

- `App.jsx` lazy-loads every route with `React.lazy` and `Suspense`.
- The farmer dashboard lazy-loads demand, schedule, and produce-intake overlays only when a farmer opens them.
- Vite produces separate chunks for each feature, so initial navigation does not download every screen.

## Component boundaries

- `LandingPage` composes the farmer dashboard only.
- `DashboardHeader`, `ServiceGrid`, and `ServiceCard` each render one dashboard concern.
- `DashboardPage` composes the slot-booking screen only.
- `SlotPageHeader`, `SlotStats`, `SlotBookingPanel`, and `BookingList` isolate the slot-screen concerns.

## Data and render strategy

- `useSlotBooking` owns slot API calls, loading states, booking actions, and derived ticket lists.
- Derived values use `useMemo`; event handlers use `useCallback`.
- Render-heavy leaf components use `React.memo`.
- The hook returns separately memoized `form` and `history` groups, so feedback or header changes do not redraw unrelated sections.

## Request flow

```text
route -> lazy page -> feature components
                    -> feature hook -> api client -> backend
```

This keeps display code separate from API orchestration and gives each feature a clear place to grow without turning pages into large, coupled files.
