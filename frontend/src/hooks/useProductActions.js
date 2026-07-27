import { useTranslation } from "react-i18next";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

/**
 * Shared cart / wishlist actions for catalog pages.
 * Returns false when the user is not authenticated.
 */
export function useProductActions() {
  const { user } = useAuth();
  const { t } = useTranslation();

  async function addToCart(productId, quantity = 1) {
    if (!user) {
      alert(t("common.loginRequired"));
      return false;
    }
    await api.post("/cart/items", { productId, quantity });
    return true;
  }

  async function addToWishlist(productId) {
    if (!user) {
      alert(t("common.loginRequired"));
      return false;
    }
    await api.post("/wishlist/items", { productId });
    return true;
  }

  function handleAddCart(product) {
    return addToCart(product.id, 1);
  }

  function handleAddWish(product) {
    return addToWishlist(product.id);
  }

  return { addToCart, addToWishlist, handleAddCart, handleAddWish };
}
