import Header from "@/Components/Header";

export const metadata = { title: "FarmMarket | KriShop", description: "Fair-price market access and demand matching for farmers" };

export default function FarmMarketLayout({ children }) {
    return (
        <div className="min-h-screen">
            <Header />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
        </div>
    );
}
