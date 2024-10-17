import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Download = () => {

    const link:string ="https://download1322.mediafire.com/81iyxob3et9g0-K8jk8noVLa8A6Wb0EOHOcwxWa3320F0R7TGRKabWaUpJVg8iP2QCr7wGGHHg6gh4Cch3BRFK6Mi3tGOYlM10f5eHKLaV9z06oQk1YsvGXxmOJFiKNkGJr6TVffev5KgRkaDTEHLI76kjvh1XTXvgNMdMnwXWqGSw/lckve0ue7f21u3n/azion_setup.exe"

    return (
        <div className="w-screen h-screen flex flex-col justify-between">
            <div className="flex flex-1 flex-col justify-center items-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">Download Azion for Desktop</h1>
                    <p className="text-xl text-gray-700 max-w-5xl">
                        Enjoy seamless access to our services directly from the Azion desktop app. 
                        With faster performance, offline access, and an intuitive interface, the desktop 
                        app ensures that you can stay connected and productive without needing a browser. 
                        Whether you're working, gaming, or simply staying in touch, our app is designed to 
                        deliver the best experience with fewer interruptions and more features at your fingertips.
                    </p>

                </div>
                <a href={link} download>
                    <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-2xl font-semibold shadow-lg transition-transform transform hover:scale-105 hover:bg-blue-700 active:scale-95">
                        Download Now
                    </button>
                </a>
            </div>
            <Footer />
        </div>
    );
};

export default Download;
