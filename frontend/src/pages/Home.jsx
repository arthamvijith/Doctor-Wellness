import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ScrollTopButton from '../components/ScrollTopButton.jsx';
import Hero from '../sections/Hero.jsx';
import Ecosystem from '../sections/Ecosystem.jsx';
import Efficiency from '../sections/Efficiency.jsx';
import Sanctuary from '../sections/Sanctuary.jsx';
import Burnout from '../sections/Burnout.jsx';
import CallToAction from '../sections/CallToAction.jsx';
import Contact from '../sections/Contact.jsx';

function Home() {
  return (
    <div className="site-shell">
      <Header />
      <main>
        <Hero />
        <Ecosystem />
        <Efficiency />
        <Sanctuary />
        <Burnout />
        <CallToAction />
        <Contact />
      </main>
      <Footer />
      <ScrollTopButton />
    </div>
  );
}

export default Home;
