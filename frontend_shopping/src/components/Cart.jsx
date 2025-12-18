import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  cartTotal,
  decreaseQuantity,
  deleteCartItem,
  increaseQuantity,
  saveCart,
  deleteCartItemThunk,
} from "../features/cartSlice";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";

const CartPage = () => {
  const cartData = useSelector((state) => state.cartItem.cart);
  const cartInfo = useSelector((state) => state.cartItem);
  const fetchStatus = useSelector((state) => state.cartItem.status);
  const [showCart, setShowCart] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userid = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  const shipping = 30;
  const tax = 10;

  useEffect(() => {
    if (!token) {
      setShowCart(true);
    }
  }, []);

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
  }, [cartInfo, cartData, fetchStatus, dispatch]);

  useEffect(() => {
    dispatch(cartTotal());
  }, [cartData, dispatch]);

  if (showCart)
    return (
      <div className="min-h-[calc(100vh-4rem)] md:py-20 py-10 mx-2 bg-gray-50 flex items-center">
        <div className="px-4 mx-auto w-full max-w-7xl sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 text-center bg-white rounded-lg shadow-md">
            <ShoppingBag className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 text-gray-300" />
            <h2 className="mb-2 text-lg sm:text-xl md:text-2xl font-semibold text-gray-700">
              Please login to view cart
            </h2>
            <Link
              to="/login"
              className="inline-block mt-4 px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white transition-colors duration-200 bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );

 

  return (
    <div className="min-h-screen py-6 sm:py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 flex flex-col">
        <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          Shopping Cart
        </h1>

        {fetchStatus === "loading" && (
          <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <CircularProgress />
          </div>
        )}

        {cartData.length === 0 && fetchStatus == "succeeded" && (
          <div className="p-8 sm:p-10 text-center bg-white rounded-lg shadow-md">
            <ShoppingBag className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 text-gray-300" />
            <h2 className="mb-2 text-lg sm:text-xl md:text-2xl font-semibold text-gray-700">
              Your cart is empty
            </h2>
            <p className="mb-6 text-sm sm:text-base text-gray-500">
              Add some products to get started!
            </p>
            <Link
              to="/"
              className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white transition-colors duration-200 bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Continue Shopping
            </Link>
          </div>
        )}

        {cartData.length > 0 && fetchStatus == "succeeded" && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start">
            <div className="bg-white rounded-lg shadow-md max-h-[55vh] sm:max-h-[60vh] md:max-h-[65vh] lg:max-h-[70vh] overflow-y-auto">
              {cartData.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-0 sm:space-x-4 border-b border-gray-200"
                >
                  <div className="flex space-x-3 sm:space-x-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="object-contain w-20 h-20 sm:w-24 sm:h-24 rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg">
                        {item.title}
                      </h3>
                      <p className="mt-2 font-bold text-gray-700 text-sm sm:text-base md:text-lg">
                        Rs.{item.price}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <button
                        onClick={() => dispatch(decreaseQuantity(item))}
                        className="p-1.5 sm:p-2 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <span className="w-8 text-sm sm:text-base md:text-lg font-semibold text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => dispatch(increaseQuantity(item))}
                        className="p-1.5 sm:p-2 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        !token || !userid
                          ? dispatch(deleteCartItem(item))
                          : dispatch(
                              deleteCartItemThunk({
                                userid,
                                productId: item._id,
                              })
                            );
                      }}
                      className="p-1.5 sm:p-2 text-red-500 transition-colors rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 sm:p-6 lg:p-7 bg-white rounded-lg shadow-md">
              <h2 className="mb-4 text-xl sm:text-2xl font-bold text-gray-900">
                Order Summary
              </h2>
              <div className="mb-6 space-y-3 text-sm sm:text-base">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span> <span>Rs.{cartInfo.TotalPrice}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Rs.{shipping}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>Rs.{tax}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-black">
                      Rs.
                      {parseFloat(cartInfo.TotalPrice + shipping + tax).toFixed(
                        2
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  navigate("/checkout");
                }}
                className="w-full py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white transition-colors duration-200 bg-black rounded-lg hover:bg-indigo-700"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};
export default CartPage;
