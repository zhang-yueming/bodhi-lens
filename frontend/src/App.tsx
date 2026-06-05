import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import CatalogPage from './pages/CatalogPage'

const { Header, Content } = Layout

export default function App() {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 600, letterSpacing: 2 }}>
            Bodhi Lens
          </span>
        </Header>
        <Content style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
          <Routes>
            <Route path="/" element={<CatalogPage />} />
          </Routes>
        </Content>
      </Layout>
    </BrowserRouter>
  )
}
