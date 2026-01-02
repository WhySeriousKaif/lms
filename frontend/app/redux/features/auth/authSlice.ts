import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/**
 * Auth state interface
 */
interface AuthState {
    user: any | null
    token: string
}

const initialState: AuthState = {
    user: null,
    token: "",
}

/**
 * Auth slice - manages authentication state
 */
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        /**
         * Set registration token (for email activation)
         */
        userRegistration: (state, action: PayloadAction<{ token: string; user?: any }>) => {
            state.token = action.payload.token
            if (action.payload.user) {
                state.user = action.payload.user
            }
        },
        
        /**
         * Set user as logged in with access token and user data
         */
        userLoggedIn: (state, action: PayloadAction<{ accessToken: string; user: any }>) => {
            state.token = action.payload.accessToken
            state.user = action.payload.user
        },
        
        /**
         * Clear auth state on logout
         */
        userLoggedOut: (state) => {
            state.token = ""
            state.user = null
        }
    }
})

export const { userRegistration, userLoggedIn, userLoggedOut } = authSlice.actions
export default authSlice.reducer