import { useState, useContext, createContext } from 'react'
import SideNav from 'components/admin/adminSideNavbar'

export const dataContext = createContext()

export default function adminPage(){

    return (
        <div>
            <SideNav />
        </div>
    )
}