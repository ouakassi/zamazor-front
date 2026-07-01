/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Outlet } from "react-router";

import { APP_ROUTES } from "./paths";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { DashboardLayout } from "@/pages/dashboard/DashboardLayout";
import { OverviewPage } from "@/pages/dashboard/OverviewPage";
import { ProductsPage } from "@/pages/dashboard/ProductsPage";
import { CategoriesPage } from "@/pages/dashboard/CategoriesPage";
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
import { StaticInfoPage } from "@/pages/public/StaticInfoPage";
import { FAQPage } from "@/pages/public/FAQPage";
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
						path: APP_ROUTES.CONTACT,
						element: <StaticInfoPage />,
					},
					{
						path: APP_ROUTES.FAQ,
						element: <FAQPage />,
					},
					{
						path: APP_ROUTES.STORY,
						element: <StaticInfoPage />,
					},
					{
						path: APP_ROUTES.BLOG,
						element: <StaticInfoPage />,
					},
					{
						path: APP_ROUTES.HELP,
						element: <StaticInfoPage />,
					},
					{
						path: APP_ROUTES.CHAT,
						element: <StaticInfoPage />,
					},
					{
						path: APP_ROUTES.RETURNS,
						element: <StaticInfoPage />,
					},
					{
						path: APP_ROUTES.SHIPPING,
						element: <StaticInfoPage />,
					},
					{
						path: APP_ROUTES.BULK,
						element: <StaticInfoPage />,
					},
					{
						path: APP_ROUTES.ACCESSIBILITY,
						element: <StaticInfoPage />,
					},
					{
						path: APP_ROUTES.TERMS,
						element: <StaticInfoPage />,
					},
					{
						path: APP_ROUTES.PRIVACY,
						element: <StaticInfoPage />,
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
								path: "categories",
								element: <CategoriesPage />,
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
					{
						path: APP_ROUTES.CHECKOUT_SUCCESS,
						element: <CheckoutPage />,
					},
					{
						path: APP_ROUTES.CHECKOUT_CANCEL,
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
