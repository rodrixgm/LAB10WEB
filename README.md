# LAB10WEB

Part 1: Event Filters with URL State

In this part of the lab, URL-based event filtering was implemented using searchParams in the Next.js App Router.

Features implemented
Filters are stored in the URL as query parameters.
URL updates dynamically when a filter changes.
Filter state persists after refreshing the page.
Filtering is performed on the server.
Active filters are shown visually.
A reset button clears all filters.
Multiple filters can be combined.
An empty state message is displayed when no events match.
Files modified
app/events/page.tsx
app/events/EventFiltersForm.tsx
How it works

The events page reads filter values from searchParams and builds a filters object that is passed to getEvents().
This ensures filtering happens on the server side.

The EventFiltersForm updates the URL query string using router navigation, so users can:

share filtered links,
bookmark current filter combinations,
refresh without losing state.
Example URLs
/events?category=music
/events?category=music&status=upcoming
/events?search=festival&priceMax=50
/events?category=sports&status=ongoing&priceMax=100
Result

This implementation improves usability by making filters persistent, shareable, and fully integrated with server-side rendering.