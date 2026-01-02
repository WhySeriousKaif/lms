"use client"
import React from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from './redux/store'

interface Props {
    children: React.ReactNode
}

/**
 * Redux Provider component
 * Wraps the application with Redux store context
 */
const Provider: React.FC<Props> = ({ children }) => {
    return <ReduxProvider store={store}>{children}</ReduxProvider>
}

export default Provider