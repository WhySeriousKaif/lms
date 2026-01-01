import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    user: null as any,
    token: "",
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        userRegistration: (state, action) => {
            state.token= action.payload.token
            state.user= action.payload.user
        },
        userLoggedIn: (state, action) => {
            console.log("Redux: userLoggedIn action dispatched", action.payload);
            state.token = action.payload.accessToken
            state.user = action.payload.user
            console.log("Redux: State updated - user:", state.user, "token:", state.token);
        },
        userLoggedOut: (state) => {
            console.log("Redux: userLoggedOut action dispatched");
            state.token = ""
            state.user = null
            console.log("Redux: State cleared - user:", state.user, "token:", state.token);
        }
    

    }
})

export const { userRegistration, userLoggedIn, userLoggedOut } = authSlice.actions
export default authSlice.reducer