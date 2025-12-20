import React, { useEffect, useState, useRef } from "react";
import {
  FaSearch,
  FaBars,
  FaTimes,
  FaHome,
  FaShoppingCart,
  FaUser,
  FaEnvelope,
  FaHeart,
  FaSignOutAlt,
  FaUserShield,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { appLogout } from "../features/appActions";
import { apiFetch } from "../apiClient";

export default function Navbar({ hydrated ,setActiveCategory }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const [navOpen, setNavOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState(false);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const cartCount = token && !hydrated ? "" : useSelector((state) => state.cartItem.cart.length || 0);
  const wishlistCount = token && !hydrated ? "" : useSelector((state) => state.wishlistItem.wishlist.length || 0);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const searchBoxRef = useRef(null);

  const navclass =
    "flex items-center gap-2 px-2 py-2 text-white hover:text-black transition-colors duration-150";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    dispatch(appLogout());
    navigate("/", { replace: true });
  };

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setSearch(false);
      setResults([]);
    }
  }

  function handleBlur() {
    setTimeout(() => {
      setSearch(false);
      setQuery("");
      setResults([]);
    }, 250);
  }

  useEffect(() => {
    if (!query.trim()) {
      setSearch(false);
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      setIsLoading(true);

      apiFetch(`/api/search?query=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(Array.isArray(data) ? data : []);
          setSearch(true);
        })
        .catch(() => {
          setResults([]);
          setSearch(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 500);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 shadow-md">
      <nav className="w-full bg-gradient-to-r from-purple-200 to-gray-500 border-b border-gray-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
          <div className="flex items-center h-16 md:h-[70px]">
            <div className="flex items-center mr-4">
              <Link to="/" onClick={() => setActiveCategory("All")}>
                <img className="w-28" src="\logo.png" alt="" />
              </Link>
            </div>

            {/* Desktop search */}
            <div className="flex-1 hidden md:flex justify-center">
              <div
                className="relative w-full max-w-3xl me-4"
                ref={desktopSearchRef}
              >
                <input
                  value={query}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  type="search"
                  placeholder="Search products..."
                  autoComplete="off"
                  className="w-full pl-3 pr-10 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2">
                  <FaSearch className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="ml-auto flex items-center">
              {/* Desktop icons */}
              <div className="hidden md:flex items-center gap-4 text-xl">
                <Link
                  className={navclass}
                  to="/"
                  onClick={() => setActiveCategory("All")}
                >
                  <FaHome />
                </Link>

                <Link className={navclass} to="/wishlist">
                  <Badge badgeContent={wishlistCount} color="error">
                    <FaHeart />
                  </Badge>
                </Link>

                <Link className={navclass} to="/cart">
                  <Badge badgeContent={cartCount} color="error">
                    <FaShoppingCart />
                  </Badge>
                </Link>

                <Link className={navclass} to={!token ? "/login" : "/profile"}>
                  <FaUser />
                </Link>

                {role === "admin" && token && (
                  <Link
                    className="flex items-center gap-2 px-2 py-2 text-green-100 hover:text-green-300 text-pretty text-2xl"
                    to="/admin/dashboard"
                  >
                    <FaUserShield />
                  </Link>
                )}

                <Link className={navclass} to="/query">
                  <FaEnvelope />
                </Link>

                {token && (
                  <button
                    type="button"
                    className={navclass}
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt />
                  </button>
                )}
              </div>

              {/* Mobile top icons */}
              <div className="flex md:hidden items-center gap-1 text-lg">
                <button
                  className="p-2"
                  onClick={() => {
                    setShowMobileSearch(true);
                    setTimeout(() => {
                      const el = document.getElementById("mobile-search-input");
                      if (el) el.focus();
                    }, 0);
                  }}
                >
                  <FaSearch className="text-white" />
                </button>

                <Link to="/wishlist" className="p-2">
                  <Badge badgeContent={wishlistCount} color="error">
                    <FaHeart className="text-white me-1 mb-1" />
                  </Badge>
                </Link>

                <Link to="/cart">
                  <Badge badgeContent={cartCount} color="error">
                    <FaShoppingCart className="text-white mx-1 mb-1" />
                  </Badge>
                </Link>

                <button onClick={() => setNavOpen(true)} className="p-2">
                  <FaBars className="text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile search bar (hidden until search icon tapped) */}
          {showMobileSearch && (
            <div className="md:hidden py-2">
              <div className="relative" ref={mobileSearchRef}>
                <input
                  id="mobile-search-input"
                  value={query}
                  onChange={handleChange}
                  onBlur={() => {
                    setTimeout(() => {
                      setShowMobileSearch(false);
                      setQuery("");
                      setResults([]);
                      setSearch(false);
                    }, 200);
                  }}
                  type="search"
                  placeholder="Search products..."
                  autoComplete="off"
                  className="w-full pl-3 pr-10 py-2 border rounded-full focus:border-black text-sm focus:outline-none"
                />
                <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          )}
        </div>

        {/* Mobile drawer */}
        {navOpen && (
          <div className="fixed inset-0 z-40 flex">
            <button
              className="flex-1 bg-black/30"
              onClick={() => setNavOpen(false)}
              aria-label="Close menu"
            />
            <aside className="w-64 bg-white border-l border-gray-200 p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="text-base font-medium">Menu</div>
                <button onClick={() => setNavOpen(false)} className="p-2">
                  <FaTimes />
                </button>
              </div>
              <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
                <Link
                  onClick={() => {
                    setNavOpen(false), setActiveCategory("All");
                  }}
                  to="/"
                  className="flex items-center gap-3 px-2 py-2 hover:text-gray-700"
                >
                  <FaHome /> <span>Home</span>
                </Link>
                <Link
                  onClick={() => {
                    setNavOpen(false), navigate("/profile");
                  }}
                  to={!token ? "/login" : "/profile"}
                  className="flex items-center gap-3 px-2 py-2 hover:text-gray-700"
                >
                  <FaUser /> <span>{!token ? "Login" : "Profile"}</span>
                </Link>

                {role === "admin" && (
                  <Link
                    onClick={() => setNavOpen(false)}
                    to="/admin/dashboard"
                    className="flex items-center gap-3 px-2 py-2 hover:text-gray-700"
                  >
                    <FaUserShield className="text-xl" />{" "}
                    <span>Admin Panel</span>
                  </Link>
                )}

                <Link
                  onClick={() => setNavOpen(false)}
                  to="/query"
                  className="flex items-center gap-3 px-2 py-2 hover:text-gray-700"
                >
                  <FaEnvelope /> <span>Contact</span>
                </Link>

                {token && (
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setNavOpen(false);
                    }}
                    className="flex items-center gap-3 px-2 py-2 hover:text-gray-700 text-left"
                  >
                    <FaSignOutAlt /> <span>Logout</span>
                  </button>
                )}
              </nav>
            </aside>
          </div>
        )}
      </nav>

      {/* Search results overlay */}
      {search && (
        <div className="fixed inset-x-0 top-28 md:top-16 bottom-0 z-40 flex items-start justify-center pt-4 px-4">
          <div className="w-full" ref={searchBoxRef}>
            <div className="w-full max-w-2xl mx-auto border-none rounded-md shadow-lg m-1 p-4 sm:p-6 bg-white max-h-[70vh] overflow-y-auto">
              <h1 className="text-lg font-semibold mb-4">Search Results</h1>

              {isLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : (
                (() => {
                  const queryLower = query.toLowerCase();
                  const titleItems = [];
                  const categoryItems = [];
                  const categoryAdded = new Set();

                  results.forEach((product) => {
                    const title = (product.title || "").toLowerCase();
                    const category = (product.category || "").toLowerCase();

                    const matchesTitle = title.includes(queryLower);
                    const matchesCategory = category.includes(queryLower);

                    if (matchesTitle) {
                      titleItems.push({
                        key: `${product._id}-title`,
                        type: "title",
                        product,
                      });
                    }

                    if (
                      matchesCategory &&
                      !categoryAdded.has(product.category)
                    ) {
                      categoryAdded.add(product.category);
                      categoryItems.push({
                        key: `category-${product.category}`,
                        type: "category",
                        category: product.category,
                      });
                    }
                  });

                  if (titleItems.length === 0 && categoryItems.length === 0) {
                    return (
                      <p className="text-sm text-gray-500">
                        No matches found...
                      </p>
                    );
                  }

                  const MAX_ROWS = 4;
                  const MAX_CATEGORY_ROWS = 2;

                  let categoryCount = Math.min(
                    MAX_CATEGORY_ROWS,
                    categoryItems.length
                  );

                  let titleCount = Math.min(
                    MAX_ROWS - categoryCount,
                    titleItems.length
                  );

                  const remainingSlots =
                    MAX_ROWS - (titleCount + categoryCount);
                  if (remainingSlots > 0) {
                    categoryCount = Math.min(
                      categoryCount + remainingSlots,
                      categoryItems.length
                    );
                  }

                  const limitedTitles = titleItems.slice(0, titleCount);
                  const limitedCategories = categoryItems.slice(
                    0,
                    categoryCount
                  );

                  const limitedItems = [...limitedTitles, ...limitedCategories];

                  return (
                    <ul className="divide-y divide-gray-200">
                      {limitedItems.map((item) => (
                        <li
                          key={item.key}
                          onClick={() => {
                            if (item.type === "category") {
                              setActiveCategory(item.category);
                              navigate("/");
                            } else navigate(`/product/${item.product._id}`);
                          }}
                          className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-50 px-2 rounded-md"
                        >
                          {item.type === "title" && item.product.image && (
                            <img
                              src={item.product.image}
                              alt={item.product.title}
                              className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                            />
                          )}

                          <div className="flex flex-col">
                            <span className="flex text-md font-medium text-gray-900">
                              {item.type === "title"
                                ? item.product.title
                                : item.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              {item.type === "category" ? "Category" : ""}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
