import AsyncStorage from "@react-native-async-storage/async-storage";
export const tokenStorage = {
    async get(k) { return AsyncStorage.getItem(k); },
    async set(k, v) { return AsyncStorage.setItem(k, v); },
    async remove(k) { return AsyncStorage.removeItem(k); },
};