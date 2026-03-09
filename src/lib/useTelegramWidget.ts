"use client";

import { useEffect, useCallback, useState, useRef } from "react";

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

    // Keep a stable ref to the latest onAuth callback.
    // This way window.onTelegramAuth is set once and never wiped,
    // while always calling the latest version of the handler.
    const onAuthRef = useRef(onAuth);
    useEffect(() => {
        onAuthRef.current = onAuth;
    }, [onAuth]);

    // Set window.onTelegramAuth once — stable, never cleared between renders.
    useEffect(() => {
        (window as any).onTelegramAuth = (user: TelegramUser) => {
            onAuthRef.current?.(user);
        };
        return () => {
            (window as any).onTelegramAuth = undefined;
        };
    }, []); // intentionally empty — set once for the lifetime of this hook

    // Load the Telegram widget script
    useEffect(() => {
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
    }, []);

    const renderWidget = useCallback((container: HTMLElement | null) => {
        if (!container || !scriptLoaded) return;

        container.innerHTML = "";

        const sanitizedBotUsername = botUsername.replace(/^@/, "");
        const widget = document.createElement("script");
        widget.src = "https://telegram.org/js/telegram-widget.js?22";
        widget.setAttribute("data-telegram-login", sanitizedBotUsername);
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
