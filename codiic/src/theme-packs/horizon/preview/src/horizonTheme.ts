import type { ThemeContract } from './contract';
import { Footer } from './layout/Footer';
import { Header } from './layout/Header';
import { CartPage } from './pages/CartPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { OrdersPage } from './pages/OrdersPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { ProductPage } from './pages/ProductPage';
import { ProfilePage } from './pages/ProfilePage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { SignupPage } from './pages/SignupPage';
import { FeaturedCollectionSection } from './sections/FeaturedCollectionSection';
import { HeroSection } from './sections/HeroSection';

export const horizonThemeContract: ThemeContract = {
  id: 'horizon',
  Header,
  Footer,
  HeroSection,
  TestimonialsSection: FeaturedCollectionSection,
  NewArrivalsSection: FeaturedCollectionSection,
  HomePage,
  ProductPage,
  LoginPage,
  SignupPage,
  ForgotPasswordPage,
  ProfilePage,
  OrdersPage,
  PreferencesPage,
  CartPage,
};
