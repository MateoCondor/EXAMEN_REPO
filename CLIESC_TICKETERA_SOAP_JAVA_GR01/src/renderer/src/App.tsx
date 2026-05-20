import { Route, Routes } from 'react-router'
import { LoginPage } from './pages/LoginPage'
import { MainLayout } from './layouts/MainLayout'
import { SoccerGamesPage } from './pages/SoccerGamesPage'
import { LocationsPage } from './pages/LocationsPage'
import { PurchasePage } from './pages/PurchasePage'
import { ReportsPage } from './pages/ReportsPage'

function App(): React.JSX.Element {
  return (
    <Routes>
      <Route index element={<LoginPage />} />
      <Route element={<MainLayout />}>
        <Route path="soccer-games" element={<SoccerGamesPage />} />
        <Route path="locations" element={<LocationsPage />} />
        <Route path="purchase" element={<PurchasePage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  )
}

export default App
