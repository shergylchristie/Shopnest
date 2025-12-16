import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { FaStar, FaHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { Trash2 } from "lucide-react";
import {
  addTowishlist,
  deleteWishlistItem,
  deleteWishlistItemThunk,
  savewishlist,
} from "../features/wishlistSlice";
import {
  decreaseQuantity,
  deleteCartItem,
  addToCart,
  increaseQuantity,
  saveCart,
  deleteCartItemThunk,
} from "../features/cartSlice";
import { apiFetch } from "../apiClient";


import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const wishlist = useSelector((state) => state.wishlistItem.wishlist);
  const cartData = useSelector((state) => state.cartItem.cart);
  const fetchStatus = useSelector((state) => state.cartItem.status);
  const dispatch = useDispatch();

  const userid = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  async function fetchProduct() {
    try {
      setIsLoading(true);
      const response = await apiFetch(`/api/displaysingleproduct/${id}`);
      const result = await response.json();
      setProduct(result);
    } catch (error) {
      toast.error(error?.message || "Failed to load product");
    } finally {
      setIsLoading(false);
    }
  }

  const isInWishlist = wishlist.some((item) => item._id === id);
  const handleWishlist = (product) => {
    if (isInWishlist) {
      !token || !userid
        ? dispatch(deleteWishlistItem(product._id))
        : dispatch(
            deleteWishlistItemThunk({
              userid,
              productId: product._id,
            })
          );
      toast.success("Removed from Wishlist");
    } else {
      !token || !userid
        ? dispatch(addTowishlist(product))
        : dispatch(
            savewishlist({
              userid,
              productId: product._id,
            })
          );
      toast.success("Added to Wishlist");
    }
  };

  useEffect(() => {
    if (fetchStatus !== "succeeded") return;

    if (token && userid) {
      dispatch(
        saveCart({
          userid,
          cartItems: cartData.map((item) => ({
            productId: item._id,
            quantity: item.quantity,
          })),
        })
      );
    }
  }, [cartData, dispatch]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4">
        <p className="text-center text-gray-500 text-sm sm:text-base md:text-lg">
          Loading product...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4">
        <p className="text-center text-red-500 text-sm sm:text-base md:text-lg">
          Product not found.
        </p>
      </div>
    );
  }
  const cartItem = cartData.find((item) => item._id === product?._id);
  const quantity = cartItem?.quantity || 0;

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  return (
    <div className="max-w-7xl mx-auto py-4 md:py-10 px-4">
      <div className="mb-6">
        <p className="text-xs sm:text-sm text-gray-500 mb-1">
          Home / {product.category} /{" "}
          <span className="text-gray-700 font-medium">Product</span>
        </p>
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
          {product.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
        <div className="w-full">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="w-full h-52 sm:h-72 md:h-96 rounded-xl shadow-md overflow-hidden bg-white"
          >
            {images.map((img, idx) => (
              <SwiperSlide key={idx}>
                <img
                  src={img}
                  alt={product.title}
                  className="w-full h-full object-contain p-4"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="w-full rounded-xl shadow-md bg-white p-4 sm:p-5 md:p-7 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide mb-0 text-white bg-blue-400 px-3 py-1 rounded-full">
              {product.category}
            </span>
            <div className="flex items-center gap-1">
              <FaStar className="fill-yellow-300 text-sm sm:text-base md:text-lg" />
              <span className="text-[10px] sm:text-xs md:text-sm text-gray-700">
                4.7 <span className="text-gray-400">(2.8k reviews)</span>
              </span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs sm:text-sm text-gray-500 mb-1">Price</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">
              ₹{product.price}
            </p>
          </div>

          <div className="mb-6">
            <p className="text-xs sm:text-sm text-gray-500 mb-1">Description</p>
            <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="mt-auto flex items-center gap-3">
            {quantity === 0 ? (
              <button
                onClick={() => {
                  dispatch(addToCart(product));
                  toast.success("Item Successfully Added");
                }}
                className="flex-1 text-xs sm:text-sm md:text-base py-2 md:py-3 px-4 bg-green-500 hover:bg-green-600 hover:scale-[1.02] transition-transform text-white font-medium rounded-md"
              >
                Add to cart
              </button>
            ) : (
              <div className="flex items-center justify-between flex-1 border rounded-md overflow-hidden">
                {quantity === 1 ? (
                  <button
                    onClick={() => {
                      !token || !userid
                        ? dispatch(deleteCartItem(product))
                        : dispatch(
                            deleteCartItemThunk({
                              userid,
                              productId: product._id,
                            })
                          );
                      toast.success("Item removed from cart");
                    }}
                    className="px-3 py-3 bg-red-50 hover:bg-red-100 text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      dispatch(decreaseQuantity(product));
                    }}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-lg font-semibold"
                  >
                    −
                  </button>
                )}

                <span className="px-4 py-2 text-sm sm:text-base font-medium">
                  {quantity}
                </span>

                <button
                  onClick={() => {
                    dispatch(increaseQuantity(product));
                  }}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-lg font-semibold"
                >
                  +
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleWishlist(product)}
              className="p-2 md:p-3 rounded-full border border-gray-200 hover:border-red-400 hover:bg-red-50 transition"
            >
              <FaHeart
                className={`${
                  isInWishlist ? "fill-red-500 " : "fill-gray-200 "
                } text-lg sm:text-xl md:text-2xl`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
