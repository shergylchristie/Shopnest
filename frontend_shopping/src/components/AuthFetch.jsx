import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { fetchCart } from "../features/cartSlice";
import { fetchwishlist } from "../features/wishlistSlice";

const AuthFetch = () => {
  const dispatch = useDispatch();
  const ran = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userid = localStorage.getItem("user");

    if (!token || !userid) return;
    if (ran.current) return;
    ran.current = true;
    dispatch(fetchCart(userid));
    dispatch(fetchwishlist(userid));
  }, [dispatch]);

  return null;
};
export default AuthFetch;
