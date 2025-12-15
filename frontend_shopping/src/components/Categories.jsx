import React from "react";
import {
  FaTshirt,
  FaLaptop,
  FaMobileAlt,
  FaShoePrints,
  FaCouch,
  FaBook,
  FaAppleAlt,
  FaCamera,
  FaThLarge,
} from "react-icons/fa";

const Categories = ({ activeCategory, setActiveCategory }) => {
  const categories = [
    { name: "All", icon: <FaThLarge /> },
    { name: "Fashion", icon: <FaTshirt /> },
    { name: "Electronics", icon: <FaLaptop /> },
    { name: "Mobile", icon: <FaMobileAlt /> },
    { name: "Footwear", icon: <FaShoePrints /> },
    { name: "Furniture", icon: <FaCouch /> },
    { name: "Books", icon: <FaBook /> },
    { name: "Grocery", icon: <FaAppleAlt /> },
    { name: "Camera", icon: <FaCamera /> },
  ];

  return (
    <div className="flex min-w-full gap-8 overflow-x-auto px-4 pt-4 md:pt-5 py-3 bg-gradient-to-r from-blue-50 via-white to-blue-50 shadow-md">
      {categories.map((cat, index) => (
        <button
          key={index}
          onClick={() => setActiveCategory(cat.name)}
          className={`flex flex-col items-center text-gray-700 hover:text-purple-600 focus:outline-none no-underline hover:underline hover:decoration-4 hover:underline-offset-4 hover:decoration-blue-600 transition-all duration-200 ${
            activeCategory === cat.name ? "text-purple-600" : ""
          }`}
          style={{ minWidth: "60px" }}
        >
          <span className="text-xl mb-1">{cat.icon}</span>
          <span className="text-xs font-semibold">{cat.name}</span>
        </button>
      ))}
    </div>
  );
};

export default Categories;
