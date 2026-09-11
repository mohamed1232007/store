import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageProvider";
import { NotificationProvider } from "./context/NotificationContext";
import StorePage from "./pages/store/StorePage";
import CheckoutPage from "./pages/store/CheckoutPage";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import Overview from "./pages/admin/Overview";
import ProductsManager from "./pages/admin/ProductsManager";
import OrdersManager from "./pages/admin/OrdersManager";
import BookingsManager from "./pages/admin/BookingsManager";
import TicketsManager from "./pages/admin/TicketsManager";
import StorePickupsManager from "./pages/admin/StorePickupsManager";

function App() {
    return (
        
        <LanguageProvider>
            <AuthProvider>
                <NotificationProvider>
                    <Router>
                    <Routes>
                        <Route path="/" element={<StorePage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />

                        <Route path="/admin" element={<AdminRoute />}>
                            <Route element={<AdminLayout />}>
                                <Route index element={<Overview />} />
                                <Route
                                    path="products"
                                    element={<ProductsManager />}
                                />
                                <Route
                                    path="orders"
                                    element={<OrdersManager />}
                                />
                                <Route
                                    path="bookings"
                                    element={<BookingsManager />}
                                />
                                <Route
                                    path="store-pickups"
                                    element={<StorePickupsManager />}
                                />
                                <Route
                                    path="tickets"
                                    element={<TicketsManager />}
                                />
                            </Route>
                        </Route>

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    <Analytics />
                    </Router>
                </NotificationProvider>
            </AuthProvider>
        </LanguageProvider>
        
    );
}

export default App;
