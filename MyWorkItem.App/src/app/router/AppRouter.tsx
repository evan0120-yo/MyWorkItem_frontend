import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminWorkItemFormPage } from '../../pages/AdminWorkItemFormPage'
import { AdminWorkItemsPage } from '../../pages/AdminWorkItemsPage'
import { WorkItemDetailPage } from '../../pages/WorkItemDetailPage'
import { WorkItemsPage } from '../../pages/WorkItemsPage'
import { AppShell } from '../layouts/AppShell'
import { AdminRoute } from './AdminRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Navigate to="/work-items" replace />} />
        <Route path="work-items" element={<WorkItemsPage />} />
        <Route path="work-items/:id" element={<WorkItemDetailPage />} />

        <Route element={<AdminRoute />}>
          <Route path="admin/work-items" element={<AdminWorkItemsPage />} />
          <Route path="admin/work-items/new" element={<AdminWorkItemFormPage />} />
          <Route
            path="admin/work-items/:id/edit"
            element={<AdminWorkItemFormPage />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/work-items" replace />} />
      </Route>
    </Routes>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppRoutes />
    </BrowserRouter>
  )
}
