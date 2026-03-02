import './styles.css'
import About from './components/about'
import Footer from './components/footer'
import Header from './components/header'
import Landing from './components/landing'
import Services from './components/services'

// This is the main page component for the home page of the application. It imports and renders the Header, Landing, About, Services, and Footer components to create a complete landing page for the website. The styles.css file is also imported to apply global styles to the page.
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
