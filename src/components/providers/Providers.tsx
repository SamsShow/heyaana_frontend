'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from '@privy-io/wagmi'
import { config } from '@/lib/wagmi'
import { polygon } from 'viem/chains'
import { useEffect } from 'react'
import { TOKEN_STORAGE_KEY } from '@/lib/auth-api'

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cm78y0lyj0382j20qjpsl40ic" // Placeholder

    useEffect(() => {
        if (typeof window === 'undefined') return
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token') || params.get('jwt') || params.get('access_token')

        if (token) {
            localStorage.setItem(TOKEN_STORAGE_KEY, token)
            // Clean URL
            const url = new URL(window.location.href)
            url.searchParams.delete('token')
            url.searchParams.delete('jwt')
            url.searchParams.delete('access_token')
            window.history.replaceState({}, '', url.toString())
            // Force reload or re-validate if needed, but useAuth uses SWR so it should react
            window.location.reload()
        }
    }, [])

    return (
        <PrivyProvider
            appId={appId}
            config={{
                appearance: {
                    theme: 'dark',
                    accentColor: '#2E5CFF',
                    logo: '/heyannalogo.png',
                },
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: 'users-without-wallets',
                    },
                },
                defaultChain: polygon,
                supportedChains: [polygon]
            }}
        >
            <QueryClientProvider client={queryClient}>
                <WagmiProvider config={config}>
                    {children}
                </WagmiProvider>
            </QueryClientProvider>
        </PrivyProvider>
    )
}
