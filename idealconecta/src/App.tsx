import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Ferias } from './pages/Ferias'
import { Holerite } from './pages/Holerite'
import { MeusDados } from './pages/MeusDados'
import { Beneficios } from './pages/Beneficios'
import { Declaracoes } from './pages/Declaracoes'
import { Comunicados } from './pages/Comunicados'
import { Galeria } from './pages/Galeria'
import { Treinamentos } from './pages/Treinamentos'
import { Reconhecimentos } from './pages/Reconhecimentos'
import { DescricaoCargos } from './pages/DescricaoCargos'
import { Politicas } from './pages/Politicas'
import { AprovacaoFerias } from './pages/AprovacaoFerias'
import { AdminLogin } from './pages/admin/AdminLogin'
import { AdminLayout, AdminHome } from './pages/admin/AdminDashboard'
import { AdminColaboradores } from './pages/admin/AdminColaboradores'
import { AdminTreinamentoAcessos } from './pages/admin/AdminTreinamentoAcessos'

export default function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Panel */}
      <Route path="/admin" element={<ProtectedRoute requireGestao><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminHome />} />
        <Route path="colaboradores" element={<AdminColaboradores />} />
        <Route path="comunicados" element={<Comunicados />} />
        <Route path="aprovacoes" element={<AprovacaoFerias />} />
        <Route path="reconhecimentos" element={<Reconhecimentos />} />
        <Route path="treinamentos" element={<Treinamentos />} />
        <Route path="treinamentos-acessos" element={<AdminTreinamentoAcessos />} />
        <Route path="galeria" element={<Galeria />} />
        <Route path="politicas" element={<Politicas />} />
      </Route>

      {/* Portal do Colaborador */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="ferias" element={<Ferias />} />
        <Route path="holerite" element={<Holerite />} />
        <Route path="meus-dados" element={<MeusDados />} />
        <Route path="beneficios" element={<Beneficios />} />
        <Route path="declaracoes" element={<Declaracoes />} />
        <Route path="comunicados" element={<Comunicados />} />
        <Route path="galeria" element={<Galeria />} />
        <Route path="treinamentos" element={<Treinamentos />} />
        <Route path="reconhecimentos" element={<Reconhecimentos />} />
        <Route path="cargos" element={<DescricaoCargos />} />
        <Route path="politicas" element={<Politicas />} />
      </Route>
    </Routes>
  )
}
