const GoogleLoginButton = () => {
    const handleGoogleLogin = () => {
        const googleAuthURL = `https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI}&scope=openid%20email%20profile`;
        window.location.href = googleAuthURL;
    };

    return (
        <button onClick={handleGoogleLogin} className="p-2 bg-blue-500 text-white rounded">
            Sign in with Google
        </button>
    );
};

export default GoogleLoginButton;
