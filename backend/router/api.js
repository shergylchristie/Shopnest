const apiRoutes = require("express").Router();
const userController = require("../controller/user");
const adminController = require("../controller/admin");   
const uploads = require("../middleware/upload");
const { auth, adminAuth } = require("../middleware/auth");


apiRoutes.post("/registerUser", userController.registerUserController);
apiRoutes.post("/userLogin", userController.userLoginController);
apiRoutes.get("/displayproducts", userController.displayProductController);
apiRoutes.get("/displaysingleproduct/:id", userController.displaySingleProductController);
apiRoutes.get("/getCategory", userController.displayProductController);
apiRoutes.post("/cart/save", auth, userController.saveCartController);
apiRoutes.get("/search", userController.searchProductsController);
apiRoutes.get("/cart/fetch/:userid", auth, userController.fetchCartController);
apiRoutes.delete("/cart/delete/:userid/:productId",userController.deleteCartItemController);
apiRoutes.post("/createOrder", userController.createOrderController);
apiRoutes.post("/verify", auth, userController.orderVerifyController);
apiRoutes.post("/userQuery", userController.userQueryController);
apiRoutes.get("/getUser/:id", userController.getUserController);
apiRoutes.put("/changeuserprofile/:id", userController.editProfileController);
apiRoutes.post("/changeuseraddress/:id", userController.changeAddressController);
apiRoutes.put("/changeuseraddress/:id/:addressId", userController.changeAddressController);
apiRoutes.put("/setDefault/:id/:addressId", userController.setDefaultAddressController);
apiRoutes.delete("/deleteAddress/:userid/:addressid", userController.deleteAddressController);
apiRoutes.put("/changepass/:id", auth, userController.changePassController);
apiRoutes.post("/wishlist/save/:userid/:productId", auth, userController.saveWishlistController);
apiRoutes.get("/wishlist/fetch/:userid", auth, userController.fetchWishlistController);
apiRoutes.delete("/wishlist/delete/:userid/:productId",userController.deleteWishlistItemController);
apiRoutes.post("/cart/merge", auth, userController.mergeGuestCartController);
apiRoutes.post("/wishlist/merge", auth, userController.mergeGuestWishlistController);


apiRoutes.get("/getQuery",auth,adminAuth,adminController.showQueryController);
apiRoutes.delete("/deleteQuery/:id",auth,adminAuth,adminController.deleteQueryController);
apiRoutes.get("/getEmail/:id",auth,adminAuth,adminController.showQueryController);
apiRoutes.post("/addproduct",auth,adminAuth,uploads.array("images", 5),adminController.addProductController);
apiRoutes.get("/getproducts",auth,adminAuth,adminController.getProductController);
apiRoutes.delete("/deleteproduct/:id",auth,adminAuth,adminController.deleteProductController);
apiRoutes.get("/editproduct/:id",auth,adminAuth,adminController.getProductController);
apiRoutes.put("/updateproduct/:id",auth,adminAuth,uploads.array("images", 5),adminController.editProductController);
apiRoutes.post("/sendReply/", auth, adminAuth, adminController.getReplyData);

module.exports = apiRoutes;
