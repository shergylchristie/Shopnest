import { useEffect, useState } from "react";
import { FaStar, FaHeart } from "react-icons/fa";
import {
  decreaseQuantity,
  deleteCartItem,
  addToCart,
  increaseQuantity,
  saveCart,
  deleteCartItemThunk,
} from "../features/cartSlice";
import { Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  addTowishlist,
  deleteWishlistItem,
  deleteWishlistItemThunk,
  savewishlist,
} from "../features/wishlistSlice";
import { apiFetch } from "../apiClient";
import { Skeleton, Box } from "@mui/material";

const ProductSkeletonGrid = () => {
  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="flex justify-center text-2xl sm:text-3xl md:text-4xl font-bold my-10">
          <Skeleton
            variant="rectangular"
            height={26}
            width={80}
            className="w-full rounded-md mb-3"
          />
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mx-2 md:mx-4 xl:mx-auto">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-full rounded-md shadow-md flex flex-col h-full bg-white p-3"
          >
            <Skeleton
              variant="rectangular"
              height={160}
              className="w-full rounded-md mb-3"
            />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
            <Skeleton
              variant="rectangular"
              width={80}
              height={24}
              className="mt-2 mb-2"
            />
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="30%" />
            <Box className="flex justify-between items-center mt-3">
              <Skeleton variant="rectangular" width={100} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
            </Box>
          </div>
        ))}
      </div>
    </div>
  );
};

const Product = ({ categoryName = "All" }) => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlistItem.wishlist);
  const cartData = useSelector((state) => state.cartItem.cart);
  const fetchStatus = useSelector((state) => state.cartItem.status);

  const userid = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  async function handlegetProducts() {
    try {
      setLoadingProducts(true);
      let url = "/api/displayproducts";
      if (categoryName && categoryName !== "All") {
        url = `/api/displayproducts?category=${categoryName}`;
      }
      const response = await apiFetch(url);
      const result = await response.json();
      setProducts(result);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  }

  const handleWishlist = (value) => {
    const isInWishlist = wishlist.some((item) => item._id === value._id);

    if (isInWishlist) {
      !token || !userid
        ? dispatch(deleteWishlistItem(value._id))
        : dispatch(deleteWishlistItem(value._id));
        dispatch(
            deleteWishlistItemThunk({
              userid,
              productId: value._id,
            })
          );
      toast.success("Removed from Wishlist");
    } else {
      !token || !userid
        ? dispatch(addTowishlist(value))
        : dispatch(addTowishlist(value));
        dispatch(
            savewishlist({
              userid,
              productId: value._id,
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
  }, [cartData, dispatch, fetchStatus, token, userid]);

  useEffect(() => {
    handlegetProducts();
  }, [categoryName]);

  if (loadingProducts) {
    return <ProductSkeletonGrid />;
  }

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div>
        <h1
          className={`flex justify-center text-2xl sm:text-3xl md:text-4xl font-bold ${
            categoryName === "All" ? "my-10" : "mt-5 mb-10"
          }`}
        >
          {categoryName === "All" ? "Products" : categoryName}
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mx-2 md:mx-4 xl:mx-auto">
        {products.map((value, index) => {
          const cartItem = cartData.find((item) => item._id === value._id);
          const quantity = cartItem?.quantity || 0;

          const isInWishlist = wishlist.some((item) => item._id === value._id);
          return (
            <div
              key={index}
              className="w-full rounded-md shadow-md flex flex-col h-full bg-white"
            >
              <Link to={`/product/${value._id}`}>
                <img
                  src={value.image}
                  alt="Product"
                  className="w-full h-40 object-contain p-2 rounded-t-md"
                />
              </Link>

              <div className="p-3 space-y-2 flex-grow">
                <Link to={`/product/${value._id}`}>
                  <h1 className="font-medium text-sm sm:text-base md:text-lg lg:text-xl">
                    {value.title}
                  </h1>
                </Link>

                <p className="font-light text-[10px] sm:text-xs md:text-sm line-clamp-2">
                  {value.description}
                </p>

                <p className="font-normal bg-blue-300 text-white rounded-md inline-block px-2 py-1 text-[10px] sm:text-xs md:text-sm">
                  {value.category}
                </p>

                <div className="flex gap-1 items-center">
                  <FaStar className="fill-yellow-300 text-sm sm:text-base" />
                  <p className="text-[10px] sm:text-xs md:text-sm">
                    4.7 <span className="text-pretty">(2.8k)</span>
                  </p>
                </div>

                <p className="font-semibold text-gray-600 text-sm sm:text-base md:text-lg">
                  ₹{value.price}
                </p>
              </div>

              <div className="flex justify-between mt-auto mb-3 px-3">
                {quantity === 0 ? (
                  <button
                    onClick={() => {
                      dispatch(addToCart(value));
                      toast.success("Item Successfully Added");
                    }}
                    className="flex-auto me-2 text-xs sm:text-lg
                        h-9 sm:h-11
                        px-3 sm:px-4
                       bg-green-500 hover:bg-green-600 hover:scale-105
                       text-white font-normal rounded-md
                        flex items-center justify-center transition"
                  >
                    Add to cart
                  </button>
                ) : (
                  <div
                    className="flex flex-auto me-2 items-center justify-between
               h-9 sm:h-11
               border rounded-md overflow-hidden"
                  >
                    {quantity === 1 ? (
                      <button
                        onClick={() => {
                          !token || !userid
                            ? dispatch(deleteCartItem(value))
                            : dispatch(
                                deleteCartItemThunk({
                                  userid,
                                  productId: value._id,
                                })
                              );
                          toast.success("Item removed from cart");
                        }}
                        className="h-full w-9 sm:w-11
                   flex items-center justify-center
                   bg-red-50 hover:bg-red-100 text-red-600"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          dispatch(decreaseQuantity(value));
                        }}
                        className="h-full w-9 sm:w-11
                   flex items-center justify-center
                   bg-gray-100 hover:bg-gray-200
                   text-lg font-semibold"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                    )}

                    <span
                      className="min-w-[2rem] sm:min-w-[2.5rem]
                     text-center
                     text-xs sm:text-sm font-medium"
                    >
                      {quantity}
                    </span>

                    <button
                      onClick={() => {
                        dispatch(increaseQuantity(value));
                      }}
                      className="h-full w-9 sm:w-11
                 flex items-center justify-center
                 bg-gray-100 hover:bg-gray-200
                 text-lg font-semibold"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                )}

                <button onClick={() => handleWishlist(value)}>
                  <FaHeart
                    className={`my-auto text-xl sm:text-3xl hover:scale-105 transition-transform
                              ${
                                isInWishlist
                                  ? "fill-red-500 hover:fill-red-600"
                                  : "fill-gray-200 hover:fill-gray-300"
                              }
                               `}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Product;
