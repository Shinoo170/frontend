import { useState, useContext, createContext } from 'react'
import SideNav from 'components/admin/adminSideNavbar'

export const dataContext = createContext()

export default function AdminPage(){

    return (
        <div>
            <SideNav />
        </div>
    )
}