import Link from "next/link";

const Download = () => {
    const link:string ="https://download1322.mediafire.com/81iyxob3et9g0-K8jk8noVLa8A6Wb0EOHOcwxWa3320F0R7TGRKabWaUpJVg8iP2QCr7wGGHHg6gh4Cch3BRFK6Mi3tGOYlM10f5eHKLaV9z06oQk1YsvGXxmOJFiKNkGJr6TVffev5KgRkaDTEHLI76kjvh1XTXvgNMdMnwXWqGSw/lckve0ue7f21u3n/azion_setup.exe";

    return (
        <div className="w-screen h-screen flex flex-col justify-between bg-background text-gray-200">
            {/* Back Button */}
            <div className="absolute top-6 left-6">
                <Link href="/">
                    <button className="bg-gray-700 text-white px-5 py-3 rounded-full text-lg font-medium hover:bg-gray-600 hover:-translate-y-1 transition-all shadow-lg">
                        ← Back to Home
                    </button>
                </Link>
            </div>

            {/* Main Download Section */}
            <div className="flex flex-1 flex-col justify-center items-center">
                <div className="text-center mb-12 px-6">
                    <h1 className="text-6xl font-extrabold text-gray-100 mb-4">Download Azion for Desktop</h1>
                    <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
                        Unlock seamless access to our services with the Azion desktop app. Experience faster performance, offline access, 
                        and an intuitive design that allows you to stay connected and productive. Whether for work, gaming, or communication, 
                        enjoy the best experience with powerful features right at your fingertips.
                    </p>
                </div>

                {/* Download Button */}
                <a href={link} download>
                    <button className="bg-gradient-to-r from-accent to-lightAccent text-white px-10 py-4 rounded-full text-2xl font-semibold shadow-lg transform hover:scale-105 hover:from-lightAccent hover:to-neonAccent transition-all duration-300 ease-in-out">
                        Download Now
                    </button>
                </a>
            </div>
        </div>
    );
};

export default Download;
