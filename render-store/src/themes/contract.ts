import type { ComponentType } from "react";

export type ThemeComponent = ComponentType;

export interface ThemeContract {
  id: "gaming" | "beauty" | "shoes" | "horizon" | "studio" | "bloom" | "volt";
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
}
