import SideNav from '@/app/ui/dashboard/sidenav';
import { Fragment } from 'react';

export default function LayOut({ children } : {children: React.ReactNode }){
    return (
        <div className="flex h-schreen flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-64">
                <SideNav/>
            </div>        
            <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
        </div>
    );
}