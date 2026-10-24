import Header from "@/Components/Header";



export default function LoginLayout({ children }) {
    return (
        <div>
            <Header />
            {children}
        </div>
    )
}
