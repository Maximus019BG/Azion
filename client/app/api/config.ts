export const apiUrl: string = "https://api.azion.online/api" //http://localhost:8080/api  https://api.azion.online/api
export const chatUrl: string = "https://api.azion.online/chat" //!https for the handshake => upgrade to ws http://localhost:8080/chat     https://api.azion.online/chat

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
