import { Link } from "react-router-dom";

const Hero = ({setActiveCategory}) => (
  <section className="max-w-full bg-gray-50 py-4 md:py-8 m-2 rounded-lg border border-gray-200 shadow-sm transition-shadow hover:shadow-md overflow-x-hidden">
    <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4 md:px-6">
      {/* Left: Description */}
      <div className="w-full md:w-1/2 mb-6 md:mb-0">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">
          Discover New Styles for Every Season
        </h1>
        <p className="text-base sm:text-lg text-gray-700 mb-4">
          Find trendy products and exclusive deals — fashion, electronics, and
          more!
        </p>
        <Link
          onClick={()=>{setActiveCategory("Fashion")}}
          className="inline-block px-5 py-2.5 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors"
        >
          Shop Now
        </Link>
      </div>

      <div className="w-full md:w-1/2 flex justify-center">
        <img
          src="fashion.png"
          alt="Shopping bags and products"
          className="max-w-full max-h-64 rounded-lg shadow-md object-cover"
          style={{ width: "auto", height: "auto" }}
        />
      </div>
    </div>
  </section>
);

export default Hero;
