import NextAuth from "next-auth";
import {authConfig} from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import type {User} from '@/app/lib/definitions';
import {z} from 'zod';
import { sql } from "@vercel/postgres";
import bcrypt from 'bcrypt';

async function getUser(email: string):Promise<User | undefined>{
    try{
        const user = await sql<User>`SELECT * FROM USERS WHERE EMAIL=${email}`;
        console.log("getUser result : "+ user);

        return user.rows[0];
    }catch(error){
        console.error('FAiled to Fetch user:', error);
        throw new Error('Failed to fetch user');
    }
}

export const {auth, signIn, signOut} = NextAuth({
    ...authConfig,
    providers:[
        Credentials({
            async authorize(credentials){
                //입력값
                const parseCredentials = z
                .object({
                    email: z.string().email(),
                    password: z.string().min(6)
                })
                .safeParse(credentials);

                if(parseCredentials.success){
                    const {email, password} = parseCredentials.data;
                    const user = await getUser(email);
                    if(!user){
                        return null;
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    //입력값과 db 값 비교
                    if(passwordsMatch){
                        return user;
                    }
                }
                return null;
            }

    })]
});