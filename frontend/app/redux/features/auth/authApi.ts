import { apiSlice } from '../api/apiSlice'
import { userRegistration, userLoggedIn, userLoggedOut } from './authSlice'


type RegistrationResponse={
    message:string,
    activationToken:string,


}

type RegistrationData={
    name: string;
    email: string;
    password: string;
}

type ActivationResponse={
    success: boolean;
    message: string;
}

type ActivationData={
    activation_token: string;
    activation_code: string;
}

type LoginResponse={
    success: boolean;
    message: string;
    user: any;
    accessToken?: string;
}

type LoginData={
    email: string;
    password: string;
}

export const authApi = apiSlice.injectEndpoints({
    overrideExisting: true,
    
    endpoints: (builder) => ({
        register: builder.mutation<RegistrationResponse, RegistrationData>({
            query: (data) => ({
                url: '/register',
                method: 'POST',
                body: data,
                credentials: 'include' as const,
            }),
            async onQueryStarted(arg, { queryFulfilled,dispatch }) {
                try {
                    const { data } = await queryFulfilled
                    dispatch(userRegistration({
                        token: data.activationToken,
                    }))
                } catch (error) {
                    console.log(error)
                }
            },
        }),
        activation: builder.mutation<ActivationResponse, ActivationData>({
            query: (data) => ({
                url: '/activate-user',
                method: 'POST',
                body: {
                    activation_token: data.activation_token,
                    activation_code: data.activation_code,
                },
                credentials: 'include' as const,
            }),
        }),
        login: builder.mutation<LoginResponse, LoginData>({
            query: (data) => ({
                url: '/login',
                method: 'POST',
                body: data,
                credentials: 'include' as const,
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled;
                    console.log("Login response:", data);
                    
                    // Wait a bit for cookies to be set
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    // Fetch user info after login using accessToken in header
                    try {
                        // Fix double slash issue - ensure proper URL construction
                        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URI?.endsWith('/') 
                            ? process.env.NEXT_PUBLIC_SERVER_URI.slice(0, -1) 
                            : process.env.NEXT_PUBLIC_SERVER_URI;
                        const meUrl = `${baseUrl}/me`;
                        console.log("🔗 Fetching user from:", meUrl);
                        const userResponse = await fetch(meUrl, {
                            credentials: 'include',
                            headers: {
                                'Authorization': `Bearer ${data.accessToken}`,
                            },
                        });
                        console.log("User fetch response status:", userResponse.status);
                        if (userResponse.ok) {
                            const userData = await userResponse.json();
                            console.log("User data fetched:", userData);
                            const userPayload = {
                                accessToken: data.accessToken || "",
                                user: userData.user,
                            };
                            console.log("📤 Dispatching userLoggedIn with payload:", userPayload);
                            console.log("📤 User object:", JSON.stringify(userData.user, null, 2));
                            
                            // Dispatch the action
                            dispatch(userLoggedIn(userPayload));
                            console.log("✅ User state updated in Redux - dispatched");
                            
                            // Trigger a custom event to notify components
                            if (typeof window !== 'undefined') {
                                window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: userData.user }));
                            }
                        } else {
                            const errorText = await userResponse.text();
                            console.log("Failed to fetch user, status:", userResponse.status, "error:", errorText);
                            // Still dispatch with null user, but with token
                            dispatch(userLoggedIn({
                                accessToken: data.accessToken || "",
                                user: null,
                            }));
                        }
                    } catch (userError) {
                        console.log("Error fetching user info:", userError);
                        // Still dispatch with null user, but with token
                        dispatch(userLoggedIn({
                            accessToken: data.accessToken || "",
                            user: null,
                        }));
                    }
                } catch (error) {
                    console.log("Login error:", error);
                }
            },
        }),
        logout: builder.mutation<{ success: boolean; message: string }, void>({
            query: () => ({
                url: '/logout',
                method: 'POST',
                credentials: 'include' as const,
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    await queryFulfilled;
                    console.log("✅ Logout successful - clearing Redux state");
                    dispatch(userLoggedOut());
                    // Trigger custom event for Header update
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('userLoggedOut'));
                    }
                } catch (error) {
                    console.log("Logout error:", error);
                    // Even if API fails, clear local state
                    dispatch(userLoggedOut());
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('userLoggedOut'));
                    }
                }
            },
        })
    }),
})

export const { useRegisterMutation, useActivationMutation, useLoginMutation, useLogoutMutation } = authApi