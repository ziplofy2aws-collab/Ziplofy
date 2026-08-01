import type { ComponentType } from "react";

export type ThemeComponent = ComponentType;

export interface ThemeContract {
  id: "gaming" | "beauty" | "shoes" | "horizon" | "watch" | "studio" | "bloom" | "volt";
  Header: ThemeComponent;
  Footer: ThemeComponent;
  HeroSection: ThemeComponent;
  TestimonialsSection: ThemeComponent;
  NewArrivalsSection: ThemeComponent;
  HomePage: ThemeComponent;
  ProductPage: ThemeComponent;
  LoginPage: ThemeComponent;
  SignupPage: ThemeComponent;
  ForgotPasswordPage?: ThemeComponent;
  ProfilePage: ThemeComponent;
  OrdersPage: ThemeComponent;
  PreferencesPage: ThemeComponent;
  CartPage: ThemeComponent;
  /** `/search` */
  SearchPage?: ThemeComponent;
  /** `/collections` - all collections listed */
  CollectionsListPage?: ThemeComponent;
  /** `/collections/all` - all products listed */
  AllProductsPage?: ThemeComponent;
  /** `/collection/:urlHandle` - collection details + products */
  CollectionPage?: ThemeComponent;
  /** `/404` and unmatched routes */
  NotFoundPage?: ThemeComponent;
  /** `/blogs/all` — all blogs for the store */
  AllBlogsPage?: ThemeComponent;
  /** `/blogs/:blogHandle` - blog details + posts list */
  BlogPage?: ThemeComponent;
  /** `/blogs/:blogHandle/:articleHandle` - blog post details */
  BlogPostPage?: ThemeComponent;
}
