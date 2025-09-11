export default function AboutPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-800">
            <div className="bg-white shadow-md rounded-lg p-8 max-w-2xl">
                <h1 className="text-4xl font-bold text-center mb-4 text-blue-600">About Us</h1>
                <p className="text-lg leading-relaxed text-center mb-4">
                    Welcome to <span className="font-semibold">MovieShop</span>! We, <span className="font-semibold">Delta Team</span>, are passionate about bringing you the best movies to enjoy.
                </p>
                <p className="text-lg leading-relaxed text-center">
                    Our mission is to provide a seamless and enjoyable movie shopping experience.
                </p>
            </div>
        </div>
    );
}