import Alpine from "alpinejs";

window.Alpine = Alpine;
window.API_TOKEN = process.env.API_TOKEN;
window.API_BASE_URL = process.env.API_BASE_URL;

Alpine.start();
