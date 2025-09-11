export default function ContactPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-800">
      <div className="p-5 font-sans max-w-3xl mx-auto leading-relaxed text-gray-800 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-blue-600 mb-2">Contact Us</h1>
        <p className="text-base text-gray-600 mb-4">
          Welcome to the contact page of Team Delta!
        </p>
        <h2 className="text-1xl font-bold text-gray-600 mt-5 mb-2">Our Team</h2>
        <ul className="list-none p-0 m-2">
          <li className="text-base text-gray-600 mb-1">Tarek Aaraichi</li>
          <li className="text-base text-gray-600 mb-1">Johan</li>
          <li className="text-base text-gray-600 mb-1">Muhannad</li>
          <li className="text-base text-gray-600 mb-1">Ibbe</li>
        </ul>
        <h2 className="text-1xl font-bold text-gray-700 mt-5 mb-2">
          Contact Information
        </h2>
        <p className="text-base text-gray-600">
          If you have any questions, feel free to reach out to us!
        </p>
      </div>
    </div>
  );
}
