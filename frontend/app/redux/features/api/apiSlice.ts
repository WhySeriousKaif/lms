import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { userLoggedIn, userLoggedOut } from '../auth/authSlice'

/**
 * Base API slice for RTK Query
 * Handles common API configuration and base endpoints
 */
export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ 
        baseUrl: process.env.NEXT_PUBLIC_SERVER_URI,
        credentials: 'include',
        prepareHeaders: (headers) => {
            headers.set('Content-Type', 'application/json')
            return headers
        },
    }),
    tagTypes: ['User', 'Auth'],
    endpoints: (builder) => ({
        /**
         * Refresh access token using refresh token from httpOnly cookie
         */
        refreshToken: builder.query<{ accessToken?: string }, void>({
            query: () => ({
                url: '/refresh',
                method: 'GET',
            }),
        }),
        
        /**
         * Load current user data
         * Automatically updates auth state on success, clears on failure
         */
        loadUser: builder.query<{ user: any; accessToken?: string }, void>({
            query: () => ({
                url: '/me',
                method: 'GET',
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    const result = await queryFulfilled
                    // Update auth state with user data
                    dispatch(userLoggedIn({
                        accessToken: result.data.accessToken || "",
                        user: result.data.user,
                    }))
                } catch (error: any) {
                    // Clear auth state if user load fails (unauthorized)
                    if (error?.status === 401) {
                        dispatch(userLoggedOut())
                    }
                }
            }
        }),
    }),
})