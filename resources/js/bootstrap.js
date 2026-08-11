window.APP_NAME = "Polyclinic HMS";

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

import axios from "axios";
window.axios = axios;

// Set the base URL for API calls
// For local development: use localhost:8000
// For production: use the live server URL
// Set base URL for API calls
// For local development: use localhost:8000
// For production: use the live server URL
// For local development with Vite on port 5173 and Laravel on port 8000
window.axios.defaults.baseURL = import.meta.env.DEV
  ? "http://localhost:8000"
  : window.location.origin;

// Add timeout configuration to prevent hanging requests
window.axios.defaults.timeout = 45000; // 45 seconds timeout for complex operations like clinical notes

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
window.axios.defaults.headers.common["Accept"] = "application/json";
window.axios.defaults.headers.common["Content-Type"] = "application/json";
window.axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
window.axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      // Define public routes that don't require authentication
      const publicRoutes = [
        "/",
        "/about",
        "/features",
        "/appointment",
        "/contact",
        "/login",
      ];
      const currentPath = window.location.pathname;
      const isPublicRoute = publicRoutes.some((route) => currentPath === route);

      // Only redirect to login if we're not already on a public route AND not already on login
      if (!isPublicRoute && window.location.href.indexOf("/login") === -1) {
        // Clear the invalid token
        localStorage.removeItem("token");

        // Prevent multiple redirects by setting a flag
        if (!window.sessionStorage.getItem("redirecting_to_login")) {
          window.sessionStorage.setItem("redirecting_to_login", "true");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

// import Echo from "laravel-echo";

// import Pusher from "pusher-js";
// window.Pusher = Pusher;

// window.Echo = new Echo({
//     broadcaster: "pusher",
//     key: import.meta.env.VITE_PUSHER_APP_KEY,
//     wsHost: import.meta.env.VITE_PUSHER_HOST ?? `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
//     wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
//     wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,
//     forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? "https") === "https",
//     enabledTransports: ["ws", "wss"],
// });
