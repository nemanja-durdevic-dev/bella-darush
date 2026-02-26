import './styles.css'
import About from './components/about'
import Footer from './components/footer'
import Header from './components/header'
import Landing from './components/landing'
import Services from './components/services'

export default async function HomePage() {
  return (
    <div>
      <Header />
      <Landing />
      <About />
      <Services />
      <Footer />
    </div>
  )
}
