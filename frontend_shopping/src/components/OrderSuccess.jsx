import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { resetPayment } from "../features/cartSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";



const OrderSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const dispatch = useDispatch()

  if (!state?.paymentId || !token) {
    return navigate("/login", { replace: true });
  }

  useEffect(() => {
    dispatch(resetPayment());
  }, []);


  return (
    <div className="min-h-96 flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Order Confirmed</h1>
        <p className="text-gray-600 mb-4">
          Thank you for your purchase. Your payment was successful.
        </p>

        {state?.paymentId && (
          <p className="text-sm text-gray-500 mb-6">
            Payment ID: <span className="font-medium">{state.paymentId}</span>
          </p>
        )}

        <Link
          to="/"
          className="inline-block bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
