import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authApi";
import { departmentsApi } from "./api/departmentsApi";
import { usersApi } from "./api/usersApi";
import { doctorsApi } from "./api/doctorsApi";
import { patientsApi } from "./api/patientsApi";
import { diagnosisApi } from "./api/diagnosisApi";

export const store = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [departmentsApi.reducerPath]: departmentsApi.reducer,
        [usersApi.reducerPath]: usersApi.reducer,
        [doctorsApi.reducerPath]: doctorsApi.reducer,
        [patientsApi.reducerPath]: patientsApi.reducer,
        [diagnosisApi.reducerPath]: diagnosisApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware, departmentsApi.middleware, usersApi.middleware, doctorsApi.middleware, patientsApi.middleware, diagnosisApi.middleware),
    devTools: true,
})