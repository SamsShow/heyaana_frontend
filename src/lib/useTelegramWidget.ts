"use client";

import { useEffect, useCallback, useState } from "react";

interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
}

interface UseTelegramWidgetOptions {
    botUsername: string;
    onAuth?: (user: TelegramUser) => void;
    authUrl?: string; // Redirect-based flow
    buttonSize?: "large" | "medium" | "small";
    cornerRadius?: number;
    requestAccess?: "write";
    showUserPhoto?: boolean;
}

export function useTelegramWidget({
    botUsername,
    onAuth,
    authUrl,
    buttonSize = "medium",
    cornerRadius,
    requestAccess = "write",
    showUserPhoto = true,
}: UseTelegramWidgetOptions) {
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        // Define the global callback if onAuth is provided
        if (onAuth) {
            (window as any).onTelegramAuth = (user: TelegramUser) => {
                onAuth(user);
            };
        }

        // Check if script already exists
        if (document.getElementById("telegram-widget-script")) {
            setScriptLoaded(true);
            return;
        }

        const script = document.createElement("script");
        script.id = "telegram-widget-script";
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        document.head.appendChild(script);

        return () => {
            // We don't necessarily want to remove the script on unmount
            // as it might be used by other components, but we can clean up the callback
            if (onAuth) {
                (window as any).onTelegramAuth = undefined;
            }
        };
    }, [onAuth]);

    const renderWidget = useCallback((container: HTMLElement | null) => {
        if (!container || !scriptLoaded) return;

        // Clear container
        container.innerHTML = "";

        const widget = document.createElement("script");
        widget.setAttribute("data-telegram-login", botUsername);
        widget.setAttribute("data-size", buttonSize);
        if (cornerRadius !== undefined) {
            widget.setAttribute("data-radius", cornerRadius.toString());
        }
        widget.setAttribute("data-request-access", requestAccess);

        if (authUrl) {
            widget.setAttribute("data-auth-url", authUrl);
        } else {
            widget.setAttribute("data-onauth", "onTelegramAuth(user)");
        }

        if (!showUserPhoto) {
            widget.setAttribute("data-userpic", "false");
        }
        widget.async = true;

        container.appendChild(widget);
    }, [botUsername, buttonSize, cornerRadius, requestAccess, showUserPhoto, scriptLoaded, authUrl]);

    return { scriptLoaded, renderWidget };
}
