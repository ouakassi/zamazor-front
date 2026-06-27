/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Outlet } from "react-router";

import { APP_ROUTES } from "./paths";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { DashboardLayout } from "@/pages/dashboard/DashboardLayout";
import { OverviewPage } from "@/pages/dashboard/OverviewPage";
import { ProductsPage } from "@/pages/dashboard/ProductsPage";
import { OrdersPage } from "@/pages/dashboard/OrdersPage";
import NotFound from "@/pages/NotFound";
import { HomePage } from "@/pages/public/HomePage";
import LoginPage from "@/pages/public/LoginPage";
import { RegisterPage } from "@/pages/public/RegisterPage";
import { ProductDetailPage } from "@/pages/public/ProductDetailPage";
import { CartPage } from "@/pages/public/CartPage";
import { CheckoutPage } from "@/pages/public/CheckoutPage";
import { ShopPage } from "@/pages/public/ShopPage";
import { WishlistPage } from "@/pages/public/WishlistPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";
import { MainLayout } from "@/shared/layouts/MainLayout";

const RootLayout = () => {
	useScrollToTop();
	return <Outlet />;
};

const router = createBrowserRouter([
	{
		element: <RootLayout />,
		children: [
			{
				element: <MainLayout />,
				children: [
					{
						path: APP_ROUTES.HOME,
						element: <HomePage />,
					},
					{
						path: APP_ROUTES.PRODUCT,
						element: <ProductDetailPage />,
					},
					{
						path: APP_ROUTES.SHOP,
						element: <ShopPage />,
					},
					{
						path: APP_ROUTES.CART,
						element: <CartPage />,
					},
					{
						path: APP_ROUTES.WISHLIST,
						element: <WishlistPage />,
					},
					{
						element: <RequireAuth />,
						children: [
							{
								path: APP_ROUTES.PROFILE,
								element: <ProfilePage />,
							},
						],
					},
				],
			},
			{
				path: APP_ROUTES.AUTH.REGISTER,
				element: <RegisterPage />,
			},
			{
				path: APP_ROUTES.AUTH.LOGIN,
				element: <LoginPage />,
			},
			{
				element: <RequireAuth allowedRoles={["ADMIN"]} />,
				children: [
					{
						path: APP_ROUTES.DASHBOARD,
						element: <DashboardLayout />,
						children: [
							{
								index: true,
								element: <OverviewPage />,
							},
							{
								path: "products",
								element: <ProductsPage />,
							},
							{
								path: "orders",
								element: <OrdersPage />,
							},
						],
					},
				],
			},
			{
				element: <RequireAuth />,
				children: [
					{
						path: APP_ROUTES.CHECKOUT,
						element: <CheckoutPage />,
					},
				],
			},
			{
				path: APP_ROUTES.NOT_FOUND,
				element: <NotFound />,
			},
		],
	},
]);

export default router;

