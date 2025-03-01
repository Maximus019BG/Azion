const GoogleLoginButton = ({text}: { text: string }) => {
    const handleGoogleLogin = () => {
        const googleAuthURL = `https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI}&scope=openid%20email%20profile`;
        window.location.href = googleAuthURL;
    };

    return (
        <button onClick={handleGoogleLogin}
                className="flex items-center p-2 bg-white border border-gray-300 rounded shadow hover:bg-gray-100">
            <img src="/google-logo.png" alt="Google logo" className="w-6 h-6 mr-2"/>
            <span className="text-gray-700">{text}</span>
        </button>
    );
};

export default GoogleLoginButton;