export const apiUrl: string = "http://localhost:8080/api" //  https://api.azion.online/api
export const chatUrl: string = "http://localhost:8080/chat" //!https for the handshake => upgrade to ws     https://api.azion.online/chat

const getClientUrl = () => {
    const { protocol, hostname, port } = window.location; // Get protocol, hostname and port
    const domain: string = port ? `${hostname}:${port}` : hostname;
    return `${protocol}//${domain}`;
};

export const clientUrl: string = getClientUrl();
