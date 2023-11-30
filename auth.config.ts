import type {NextAuthConfig} from 'next-auth';

export const authConfig = {
    pages:{
        signIn: '/login'
    },
    callbacks:{
        authorized({auth, request:{nextUrl}}){
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

            if(isOnDashboard){ //dashboard url 진입?
                if(isLoggedIn){ //로그인 상태?
                    return true;
                }else{
                    return false;
                }
            }else if(isLoggedIn){ //로그인 상태임?
                return Response.redirect(new URL('/dashboard', nextUrl)); //dashboard 로
            }
            
            return true;
        }

    },
    providers:[]
} satisfies NextAuthConfig;