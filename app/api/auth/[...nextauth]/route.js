import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connect from '@/utils/db';
import { User } from '@/Model/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                await connect();

                const user = await User.findOne({ email: credentials.email });

                if (!user) {
                    throw new Error('No user found with that email');
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error('Invalid password');
                }

                return { 
                    id: user._id.toString(), 
                    name: user.username, 
                    email: user.email, 
                    role: user.role,
                    image: user.image || '' 
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Initial login mapping
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.image = user.image;
            }
            
            // Handle client-side session update() calls robustly
            if (trigger === "update") {
                if (session?.image) {
                    token.image = session.image;
                } else if (session?.user?.image) {
                    token.image = session.user.image;
                }
            }
            
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.image = token.image;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };