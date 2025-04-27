// export const apiUrl: string = "http://localhost:8080/api" //  https://api.azion.online/api
// export const chatUrl: string = "http://localhost:8080/chat" //!https for the handshake => upgrade to ws     https://api.azion.online/chat
//Production
// export const apiUrl: string = "https://api.azion.online/api"
// export const chatUrl: string = " https://api.azion.online/chat" //!https for the handshake => upgrade to ws

export const apiUrl: string = process.env.NEXT_PUBLIC_API_URL || "https://api.azion.online/api";
export const chatUrl: string = process.env.NEXT_PUBLIC_CHAT_URL || "https://api.azion.online/chat"; //!https for the handshake => upgrade to ws

const getClientUrl = () => {
    if (typeof window !== "undefined" && window.location) {
        const { protocol, hostname, port } = window.location; // Get protocol, hostname and port
        const domain: string = port ? `${hostname}:${port}` : hostname;
        return `${protocol}//${domain}`;
    } else {
        return "https://azion.online";
    }
};

export const clientUrl: string = getClientUrl();
