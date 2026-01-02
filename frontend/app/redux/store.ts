'use client'
import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from './features/api/apiSlice'
import authSlice from './features/auth/authSlice'

/**
 * Redux store configuration
 * Configures the application's global state management
 */
export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authSlice
    },
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: false,
            immutableCheck: false, // Disabled for performance in development
        }).concat(apiSlice.middleware),
})

/**
 * Initialize app on store creation
 * Attempts to refresh token and load user only if refresh succeeds
 */
const initializeApp = async () => {
    try {
        // First, try to refresh the token
        const refreshResult = await store.dispatch(
            apiSlice.endpoints.refreshToken.initiate(undefined, { forceRefetch: true })
        )
        
        // Only load user if refresh token was successful
        if (!refreshResult.isError && refreshResult.data) {
            await store.dispatch(
                apiSlice.endpoints.loadUser.initiate(undefined, { forceRefetch: true })
            )
        }
    } catch (error) {
        // Silently fail on initialization - user is not logged in
        console.debug('App initialization: No valid session found')
    }
}

// Initialize app when store is created
if (typeof window !== 'undefined') {
    initializeApp()
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch