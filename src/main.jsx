// Disable the browser's native scroll restoration so route changes (and the
// browser "Back" button) always render at the top instead of the old scroll height.
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ScrollToTop />
    <App />
  </BrowserRouter>
)
