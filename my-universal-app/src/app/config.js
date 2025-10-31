export const config = {
    apiUrl:
        process.env.EXPO_PUBLIC_API_URL ||
        process.env.ELECTRON_API_URL ||
        "https://todo-api-965384144322.europe-west3.run.app",
        // "http://localhost:8080",
};