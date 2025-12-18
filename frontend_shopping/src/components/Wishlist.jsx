import { Trash2, ShoppingBag } from "lucide-react";
import { FaCartArrowDown } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  deleteWishlistItem,
  deleteWishlistItemThunk,
} from "../features/wishlistSlice";
import { addToCart } from "../features/cartSlice";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const WishlistPage = () => {
  const wishlist = useSelector((state) => state.wishlistItem.wishlist);
  const [showwishlist, setShowwishlist] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userid = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setShowwishlist(true);
    }
  }, []);

  function handleAdd(item) {
    if (!userid) {
      navigate("/login");
      return;
    }
    dispatch(addToCart(item));
    dispatch(deleteWishlistItem(item));
    dispatch(deleteWishlistItemThunk({ userid, productId: item._id }));
    toast.success("Moved to Cart");
  }

  if (showwishlist)
    return (
      <div className="min-h-[calc(100vh-4rem)] md:py-20 py-10 mx-2 bg-gray-50 flex items-center">
        <div className="px-4 mx-auto w-full max-w-7xl sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 text-center bg-white rounded-lg shadow-md">
            <ShoppingBag className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 text-gray-300" />
            <h2 className="mb-2 text-lg sm:text-xl md:text-2xl font-semibold text-gray-700">
              Please login to view wishlist
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
          Shopping wishlist
        </h1>

        {wishlist.length === 0 ? (
          <div className="p-8 sm:p-10 text-center bg-white rounded-lg shadow-md">
            <ShoppingBag className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 text-gray-300" />
            <h2 className="mb-2 text-lg sm:text-xl md:text-2xl font-semibold text-gray-700">
              Your wishlist is empty
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
        ) : (
          <div className="flex justify-center ">
            <div className="bg-white rounded-lg shadow-md max-h-[70vh] overflow-y-auto max-w-5xl w-full">
              {wishlist.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-0 sm:space-x-4 border-b border-gray-200"
                >
                  <div className="flex space-x-3 sm:space-x-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="object-contain w-20 h-20 sm:w-24 sm:h-24  rounded-lg flex-shrink-0"
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
                        onClick={() => handleAdd(item)}
                        className=" flex p-2  transition-colors border bg-green-100 rounded-lg hover:bg-green-200 text-center"
                      >
                        <FaCartArrowDown className="w-3 h-3 m-auto sm:w-4 sm:h-4" />
                        <p className="ms-2 font-normal text-sm md:text-md">
                          Move To Cart
                        </p>
                      </button>
                    </div>
                    <button
                      title="Remove from wishlist"
                      onClick={() => {
                         !token || !userid
                           ? dispatch(deleteWishlistItem(item))
                           : dispatch(deleteWishlistItem(item));
                            dispatch(
                               deleteWishlistItemThunk({
                                 userid,
                                 productId: item._id,
                               })
                             );
                        toast.success("Removed from Wishlist");
                      }}
                      className="p-1.5 sm:p-2 text-red-500 transition-colors rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default WishlistPage;
