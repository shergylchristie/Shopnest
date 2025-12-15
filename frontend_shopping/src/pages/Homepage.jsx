import React, { useState } from "react";
import Hero from "/src/components/Hero.jsx";
import Product from "../components/Product";
import Categories from "../components/Categories";

const Homepage = ({ activeCategory, setActiveCategory }) => {
  return (
    <div>
      <Categories
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {activeCategory === "All" && (
        <Hero setActiveCategory={setActiveCategory} />
      )}

      <Product categoryName={activeCategory} />
    </div>
  );
};

export default Homepage;
