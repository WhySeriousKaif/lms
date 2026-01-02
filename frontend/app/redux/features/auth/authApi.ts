import { apiSlice } from '../api/apiSlice'
import { userRegistration, userLoggedIn, userLoggedOut } from './authSlice'

/**
 * Type definitions for auth API
 */
type RegistrationResponse = {
    message: string
    activationToken: string
}

type RegistrationData = {
    name: string
    email: string
    password: string
}

type ActivationResponse = {
    success: boolean
    message: string
}

type ActivationData = {
    activation_token: string
    activation_code: string
}

type LoginResponse = {
    success: boolean
    message: string
    user: any
    accessToken?: string
}

type LoginData = {
    email: string
    password: string
}

/**
 * Auth API endpoints
 * Extends the base API slice with authentication-related endpoints
 */
export const authApi = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        /**
         * User registration endpoint
         * Stores activation token in Redux state
         */
        register: builder.mutation<RegistrationResponse, RegistrationData>({
            query: (data) => ({
                url: '/register',
                method: 'POST',
                body: data,
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled
                    dispatch(userRegistration({
                        token: data.activationToken,
                    }))
                } catch (error) {
                    // Registration failed - error handled by RTK Query
                }
            },
        }),
        
        /**
         * Email activation endpoint
         * Activates user account with activation token and code
         */
        activation: builder.mutation<ActivationResponse, ActivationData>({
            query: (data) => ({
                url: '/activate-user',
                method: 'POST',
                body: {
                    activation_token: data.activation_token,
                    activation_code: data.activation_code,
                },
            }),
        }),
        
        /**
         * User login endpoint
         * Fetches user data after successful login and updates auth state
         */
        login: builder.mutation<LoginResponse, LoginData>({
            query: (data) => ({
                url: '/login',
                method: 'POST',
                body: data,
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled
                    
                    // Fetch user data after login
                    try {
                        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URI?.replace(/\/$/, '')
                        const userResponse = await fetch(`${baseUrl}/me`, {
                            credentials: 'include',
                            headers: {
                                'Authorization': `Bearer ${data.accessToken}`,
                                'Content-Type': 'application/json',
                            },
                        })
                        
                        if (userResponse.ok) {
                            const userData = await userResponse.json()
                            dispatch(userLoggedIn({
                                accessToken: data.accessToken || "",
                                user: userData.user,
                            }))
                            
                            // Notify components of login
                            if (typeof window !== 'undefined') {
                                window.dispatchEvent(new CustomEvent('userLoggedIn', { 
                                    detail: userData.user 
                                }))
                            }
                        } else {
                            // Login succeeded but user fetch failed - store token only
                            dispatch(userLoggedIn({
                                accessToken: data.accessToken || "",
                                user: null,
                            }))
                        }
                    } catch (userError) {
                        // User fetch failed - store token only
                        dispatch(userLoggedIn({
                            accessToken: data.accessToken || "",
                            user: null,
                        }))
                    }
                } catch (error) {
                    // Login failed - error handled by RTK Query
                }
            },
        }),
        
        /**
         * User logout endpoint
         * Clears auth state on both success and failure
         */
        logout: builder.mutation<{ success: boolean; message: string }, void>({
            query: () => ({
                url: '/logout',
                method: 'POST',
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    await queryFulfilled
                } catch (error) {
                    // Continue with logout even if API call fails
                } finally {
                    // Always clear local state
                    dispatch(userLoggedOut())
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('userLoggedOut'))
                    }
                }
            },
        })
    }),
})

// Export hooks for use in components
export const { 
    useRegisterMutation, 
    useActivationMutation, 
    useLoginMutation, 
    useLogoutMutation 
} = authApi