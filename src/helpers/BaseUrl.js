// Follow whatever host the page itself was loaded from, same as the admin
// client: on the laptop (localhost:3002) that's the backend directly, no
// cert needed; from any other device (phone on the LAN) it's the HTTPS
// proxy. A hardcoded IP breaks every time the LAN IP changes.
const host = window.location.hostname;
export const baseUrl =
  host === "localhost" || host === "127.0.0.1" ? "http://localhost:3123" : `https://${host}:3124`;
//export const baseUrl = "https://order-craft-backend.onrender.com";
// export const baseUrl = "https://api.order-craft.net";
