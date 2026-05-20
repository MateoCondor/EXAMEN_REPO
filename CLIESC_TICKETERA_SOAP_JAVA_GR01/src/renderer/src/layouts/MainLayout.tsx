import { SideNav } from '@renderer/components/SideNav'
import { Outlet } from 'react-router'

export function MainLayout() {
  return (
    <div className="grid grid-cols-[auto_1fr] h-dvh bg-sky-100 p-4 gap-x-4">
      <div className="overflow-hidden rounded-md">
        <SideNav />
      </div>
      <div className="overflow-hidden rounded-md">
        <Outlet />
      </div>
    </div>
  )
}
